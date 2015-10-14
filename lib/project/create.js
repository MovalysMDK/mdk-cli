'use strict';

var path = require('path');
var assert = require('assert');
var semver = require('semver');
var fs = require('fs-extra');
var unzip = require('unzip');
var async = require('async');
var glob = require('glob');
var clc = require('cli-color');

var system = require('../utils/system');
var network = require('../utils/network');
var isSnapshot = require('../utils/semversion/isSnapshot');
var user = require('../user');
var mdkVersions = require('../versions');
var projectConfig = require('./config');
var config = require('../config');
var displayMessagesVersion = require('../platform/common/displayMessagesVersion');
var mdkpath = require('../mdkpath');

/**
 * Create an mdk project.
 * @param applicationId application id
 * @param mdkVersion mdk version
 * @param callback callback
 */
function create( applicationId, mdkVersion, callback ) {

    assert.equal(typeof applicationId, 'string');
    assert.equal(typeof mdkVersion, 'string');
    assert.equal(typeof callback, 'function');

    if ( applicationId.indexOf(".") == -1 ) {
        callback("applicationId must be contains at least one dot. Example: com.mycompany.myproject");
        return;
    }

    if ( !semver.valid(mdkVersion)) {
        callback(mdkVersion + " is not a valid version.");
        return;
    }

    var conf = {};
    conf.project = {};
    conf.project.applicationId = applicationId;
    var index = applicationId.lastIndexOf(".");
    conf.project.artifactId = applicationId.substr( index + 1 );
    conf.project.groupId = applicationId.substr( 0, index );
    conf.project.version = "1.0.0-SNAPSHOT";
    conf.project.mdkVersion = mdkVersion;

    console.log('Create project');
    console.log('  applicationId: ' + conf.project.applicationId);
    console.log('  project version: ' + conf.project.version);
    console.log('  mdkVersion: ' + conf.project.mdkVersion);

    downloadZip(conf, function(err, zipFile ){
        if ( err) {
            callback(err);
        }
        else {
            createProjectFromZip(zipFile, conf, callback);
        }
    });
}

/**
 * Download mdk zip and store it in cache.
 * <p>Credentials are asked to user.</p>
 * <p>If zip file is already in cache, the file is not downloaded again.</p>
 * @param conf project configuration
 * @param callback callback
 */
function downloadZip( conf, callback ) {

    assert.equal(typeof conf, 'object');
    assert.equal(typeof callback, 'function');

    // test if exists in cache
    var cacheDir = path.join( mdkpath().cacheDir, 'zip' );
    var filename = 'mdk-project-' + conf.project.mdkVersion + '-bin.zip';
    var zipFile = path.join(cacheDir, filename);

    async.waterfall([
        function(cb) {
            displayMessagesVersion(conf.project.mdkVersion, cb);
        },
        function (cb) {
            // create directory .mdk/cache/zip if not exists.
            fs.ensureDir( cacheDir, function(err) {
                cb(err);
            });
        },
        function (cb) {
            mdkVersions.get(conf.project.mdkVersion, false, function(err) {
                if ( err ) {
                    cb(err);
                }
                else cb();
            });
        },
        function (cb) {
            // check if zip file is in cache. The cache is ignored if mdk version is a snapshot.
            fs.access(zipFile, fs.R_OK, function(err) {
                if ( err || isSnapshot(conf.project.mdkVersion) ) {
                    cb();
                }
                else {
                    console.log('  use cached ' + zipFile);
                    callback(null, zipFile);
                }
            });
        },
        function (cb) {
            user.loadCredentials( function(err, username, password ) {
                cb(null, username, password);
            });
        },
        function (username, password, cb) {
            config.getList(["mdkRepoRelease","mdkRepoSnapshots", "snapshotEnable"], function (err, values) {
                if (err) {
                    cb(err);
                }
                else {
                    // if snapshot enabled and mdk version is a snapshot, then use the snapshot repository.
                    if ( values.snapshotEnable === "true" && isSnapshot(conf.project.mdkVersion)) {
                        cb(null, values.mdkRepoSnapshots, username, password );
                    }
                    else {
                        // else, use the release repository
                        cb(null, values.mdkRepoRelease, username, password );
                    }
                }
            });
        },
        function (mdkRepoUrl, username, password, cb ) {
            console.log('  download mdkVersion ' + filename);
            var options = {
                url: mdkRepoUrl + '/com/sopragroup/adeuza/movalysfwk/mdk-project/' +  conf.project.mdkVersion +'/' + filename
            };
            if ( username && password ) {
                options.auth = {
                    user: username,
                    pass: password
                };
            }

            network.downloadFile(options, zipFile, function(err, result) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb(null, zipFile);
                }
            });
        }
    ], function(err, zipFile) {
        callback(err, zipFile);
    });
}

/**
 * Create project using mdk zip.
 * @param zipFile zip file
 * @param conf project configuration
 * @param callback callback
 */
function createProjectFromZip( zipFile, conf, callback ) {

    assert.equal(typeof zipFile, 'string');
    assert.equal(typeof conf, 'object');
    assert.equal(typeof callback, 'function');

    console.log('  extract zip');

    var projectDir = path.basename(zipFile, '-bin.zip');

    async.waterfall([
        function(cb) {
            // check if project directory already exists.
            fs.access( conf.project.artifactId, fs.R_OK, function(err) {
                if (err) {
                    // directory does not exist, we can continue process.
                    cb();
                }
                else {
                    // directory already exists, raise an error.
                    cb('directory already exists: ' + conf.project.artifactId);
                }
            });
        },
        function (cb) {
            // extract zip
            var unzipExtractor = unzip.Extract({ path: '.' });

            // unzip error event
            unzipExtractor.on('error', function(err) {
                cb('unzip failed: ' + err);
            });

            // extract finish event
            unzipExtractor.on('close',  function() {
                cb();
            });

            var rstream = fs.createReadStream(zipFile);
            rstream.on('error', function(err) {
                cb('unzip failed: ' + err);
            });
            rstream.pipe(unzipExtractor);
        },
        function (cb) {
            // rename directory with artifact id
            fs.rename(projectDir, conf.project.artifactId, function (err) {

                if (err) {
                    cb(err);
                }
                else {
                    // Enter directory
                    process.chdir(conf.project.artifactId);
                    cb();
                }
            });
        },
        function (cb) {
            // Save configuration
            projectConfig.writeProjectConf(conf, function(err) {
                if (err) {
                    callback(err);
                } else {
                    cb();
                }
            });
        },
        function (cb) {
            // clean project
            glob("README.*", {}, function (err, files) {
                if ( err ) {
                    callback(err);
                }
                else {
                    // delete all README.*
                    async.eachSeries( files, fs.unlink, function(err) {
                        cb(err);
                    } );
                }
            });
        }
    ], function(err) {
        if(!err) {
            console.log(clc.yellow('[Notice]') + " A new directory named '"+ conf.project.artifactId + "' has been created");
            console.log(clc.yellow('[Notice]') + " To add a platform to your project, go to the '" +
                clc.italic(conf.project.artifactId) + "' directory with command '" +
                clc.bold.italic('cd '+conf.project.artifactId) + "', then add a platform with '" +
                clc.bold.italic("mdk platform-add <platform>") + "'");
        }
        callback(err);
    });
}

module.exports = create;
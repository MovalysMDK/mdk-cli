'use strict';

var path = require('path');
var assert = require('assert');
var semver = require('semver');
var fs = require('fs-extra');
var AdmZip = require('adm-zip');
var async = require('async');
var glob = require('glob');
var clc = require('cli-color');

var system = require('../utils/system');
var network = require('../utils/network');
var mdkLog = require('../utils/log');
var isSnapshot = require('../utils/semversion/isSnapshot');
var user = require('../user');
var mdkVersions = require('../mdk/versions');
var mdkTemplates = require('../mdk/templates');
var projectConfig = require('./config');
var config = require('../config');
var displayMessagesVersion = require('../platform/common/displayMessagesVersion');
var mdkpath = require('../mdkpath');

/**
 * Create an mdk project.
 * @param applicationId application id
 * @param mdkVersion mdk version
 * @param options options
 * @param callback callback
 */
function create( applicationId, options, callback ) {

    assert.equal(typeof applicationId, 'string');
    assert.equal(typeof options, 'object');
    assert.equal(typeof callback, 'function');

    if (! /^([a-z]+\.)+[a-z]+$/.test(applicationId) ) {
        callback("applicationId must be lowercase Alphabet only and contain at least one dot. Example: com.mycompany.myproject");
    }

    //Retrieve template options
    var templateName = options.templateName;
    var templateVersion = options.templateVersion;
    var offlineMode = isOffline(options);

    var cacheDir;
    var filename;
    var zipFile;
    var conf = {};

    async.waterfall([
            function (cb) {

                cb();
            },
            function(cb) {
                if(typeof templateName === 'undefined') {
                    mdkTemplates.getDefault(false, function (err, result) {
                        cb(err, result);
                    });
                }
                else {
                    mdkTemplates.get(templateName, false, function (err, result) {
                        cb(err, result);
                    });
                }
            },
            function(templateSpec, cb) {
                conf.project = {};
                conf.project.applicationId = applicationId;
                var index = applicationId.lastIndexOf(".");
                conf.project.artifactId = applicationId.substr( index + 1 );
                conf.project.groupId = applicationId.substr( 0, index );
                conf.project.version = "1.0.0-SNAPSHOT";

                retrieveTemplateVersionObject(templateVersion, templateSpec, function(err, templateVersionObject) {
                        cb(err, templateVersionObject, templateSpec);
                    }
                );
            },
            function (templateVersionObject, templateSpec, cb) {
                conf.project.mdkVersion = templateVersionObject.mdkVersion;


                console.log('Create project from template : ' + clc.bold(templateSpec.name));
                console.log('  applicationId: ' + conf.project.applicationId);
                console.log('  project version: ' + conf.project.version);
                console.log('  mdkVersion: ' + conf.project.mdkVersion);

                cacheDir = path.join( mdkpath().cacheDir, 'zip' );

                if(typeof templateVersionObject.zipFile === 'undefined') {
                    filename = 'mdk-project-' + conf.project.mdkVersion + '-bin.zip';
                    zipFile = path.join(cacheDir, filename);

                }
                else {
                    filename = templateVersionObject.zipPath + templateVersionObject.zipFile;
                    zipFile = path.join(cacheDir, templateVersionObject.zipFile);

                }

                cb(null, templateSpec, templateVersionObject);
            },
            function(templateSpec, templateVersionObject, cb) {
                conf.template = {};
                conf.template.version = templateVersionObject.version;
                conf.template.name = templateSpec.name;
                conf.template.platforms = templateSpec.platforms;
                cb();
            },
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
                // load mdk version
                mdkVersions.get(conf.project.mdkVersion, false, function(err) {
                    if ( err ) {
                        cb(err);
                    }
                    else cb();
                });
            },
            function (cb) {
                // check if zip file is in cache. The cache is ignored if mdk version is a snapshot and online.
                fs.access(zipFile, fs.R_OK, function(err) {
                    if ( err ) {
                        // if not in cache and offline, process failure because we can't continue without the zip.
                        if ( offlineMode === true ) {
                            cb("Internet connection is required to create project.");
                        }
                        else {
                            cb(null, true);
                        }
                    }
                    else {
                        // if snapshot and online, force download to get last snapshot.
                        if ( isSnapshot(conf.project.mdkVersion) && offlineMode === false ) {
                            cb(null, true);
                        }
                        else {
                            // zip file is in cache, use it.
                            console.log('  use cached ' + zipFile);
                            cb(null, false);
                        }
                    }
                });
            },
            function(doDownload, cb) {
                if ( doDownload === true ) {
                    downloadZip(conf, filename, zipFile, cb);
                }
                else {
                    cb();
                }
            },
            function(cb) {
                createProjectFromZip(zipFile, conf, cb);
            }
        ],
        function(err) {
            callback(err);
        });


}

/**
 * Download mdk zip and store it in cache.
 * <p>Credentials are asked to user.</p>
 * <p>If zip file is already in cache, the file is not downloaded again.</p>
 * @param conf project configuration
 * @param filename zip filename to download.
 * @param cacheFile cache file.
 * @param callback callback
 */
function downloadZip( conf, filename, cacheFile, callback ) {

    assert.equal(typeof conf, 'object');
    assert.equal(typeof filename, 'string');
    assert.equal(typeof cacheFile, 'string');
    assert.equal(typeof callback, 'function');

    // test if exists in cache
    async.waterfall([
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
            if(filename.startsWith("http")) {
                var options = {
                    url: filename
                };
            }
            else {
                var options = {
                    url: mdkRepoUrl + '/com/sopragroup/adeuza/movalysfwk/mdk-project/' +  conf.project.mdkVersion +'/' + filename
                };
            }
            if ( username && password ) {
                options.auth = {
                    user: username,
                    pass: password
                };
            }

            network.downloadFile(options, cacheFile, false, function(err, result) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        }
    ], function(err) {
        callback(err);
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
            var zip = new AdmZip(zipFile);
            zip.extractAllTo(".", /*overwrite*/true);
            cb();
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
            console.log();
            mdkLog.separator();
            mdkLog.notice("New MDK project created !", "A new directory named '"+ clc.bold(conf.project.artifactId) + "' has been created");
            mdkLog.notice("To add a platform to your project, go to the '" + clc.italic(conf.project.artifactId) + "' directory with command '" +
                clc.bold.italic('cd '+conf.project.artifactId) + "', then add a platform with '" +
                clc.bold.italic("mdk platform-add <platform>") + "'");
            mdkLog.separator();
            console.log();
        }
        callback(err);
    });
}

function isOffline(options) {
    return typeof options.offline != "undefined" && options.offline === true;
}

function retrieveTemplateVersionObject (templateVersion, templateSpec, callback) {
    var templateVersionObject;
    if (typeof templateVersion === 'undefined') {
        mdkTemplates.lastVersion(templateSpec.name, callback);
    }
    else {
        async.forEach(templateSpec.versions, function (item, cb) {
            if (item.version === templateVersion) {
                templateVersionObject = item;
            }
            cb();
        }, function (err) {
            if (typeof  templateVersionObject === 'undefined') {
                err = "No MDK versions found for template '" + templateSpec.name + "' in version '" + templateVersion + "'";
            }
            callback(err, templateVersionObject);

        });
    }
}


module.exports = create;
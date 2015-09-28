'use strict'

var async = require('async');
var path = require('path');
var semver = require('semver');
var diskspace = require('diskspace');
var checksum = require('checksum');
var fs = require('fs-extra');

var system = require('../../utils/system');
var devToolsSpecs = require('../specs');
var osName = require('../../utils/system/osName');
var config = require('../../config');
var network = require('../../utils/network');

/**
 * Install tools required by mdk for platform.
 * @param platform platform target (android,ios)
 * @param mdkVersion mdk version
 * @param callback
 */
function install( platform, mdkVersion, callback ) {

    async.waterfall( [
        function (cb) {
            // compute os name.
            osName( function(err, name ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb(null, name);
                }
            });
        },
        function(osName, cb) {
            // check platform is compatible with current os.
            checkPlatform(platform, osName, function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, osName);
                }
            });
        },
        function(osName, cb) {
            // retrieve devTools specification.
            devToolsSpecs.get(mdkVersion, false, function(err, devToolsSpec) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, devToolsSpec, osName);
                }
            });
        },
        function(devToolsSpec, osName, cb) {
            // check minimal required version of mdk-cli
            fs.readJson(path.join(__dirname, '..', '..', '..', 'package.json'), function (err, result) {
                if( !err ) {
                    if ( semver.gte(result.version, devToolsSpec.mdk_cli.minVersion)) {
                        cb(null, devToolsSpec, osName);
                    }
                    else {
                        cb('mdk-cli version ' + devToolsSpec.mdk_cli.minVersion + ' is required by mdk ' + mdkVersion);
                    }
                }
                else {
                    cb(err);
                }
            })
        },
        function(devToolsSpecs, osName, cb) {
            // proceed install
            installTools(devToolsSpecs, platform, osName, cb);
        }
    ], function(err) {
        callback(err);
    });
}

/**
 * Check platform is valid :
 * <ul>
 *     <li>Is one of the following values : android, ios</li>
 *     <li>Is supported by the os => android:[osx, windows], ios:[osx]</li>
 * </ul>
 * @param platform platform
 * @param callback
 */
function checkPlatform( platform, osName, callback) {
    switch(platform) {
        case 'ios':
            system.isWin(function (isWin) {callback('iOS is not supported on Windows platform')});
            system.isLinux(function (isLinux) {callback('iOS is not supported on Linux platform')});
            break;
        case 'android':
            //Supported everwhere
            callback();
            break;
        default:
            callback("Unrecognized platform : '" + platform + "'");
            break;
    }
}

/**
 * Proceed installation of products.
 * <ul>
 *     <li>Check available disk space.</li>
 * </ul>
 * @param devToolsSpecs
 * @param platform
 * @param osName
 * @param callback
 */
function installTools(devToolsSpecs, platform, osName, callback) {

    // Compute list of tools to install.
    computeToolListToInstall(devToolsSpecs, platform, osName, function(err, missingToolSpecs) {
        if ( err ) {
            callback(err);
        }
        else {
            if ( missingToolSpecs.length > 0 ) {
                async.each(missingToolSpecs, function(missingToolSpec, cb) {

                    console.log("Install " + missingToolSpec.name + " v" + missingToolSpec.version);
                    downloadPackages(missingToolSpec, function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            cleanWorkDir(missingToolSpec, function (err) {
                                if ( err ) {
                                    cb(err);
                                }
                                else {
                                    // backup current dir
                                    var currentDir = process.cwd();

                                    var script = require("./" + missingToolSpec.script + "." + osName);
                                    script.install(missingToolSpec, function(err) {
                                        // restore current dir
                                        process.chdir(currentDir);

                                        cb(err);
                                    });
                                }

                            });
                        }
                    });

                }, callback);
            }
            else {
                callback();
            }
        }
    });
}

/**
 *
 * @param devToolsSpec
 * @param platform
 * @param callback
 */
function computeToolListToInstall(devToolsSpec, platform, osName, callback ) {

    console.log("computeToolToInstall" );
    console.log("platform:" + platform);
    console.log("osName:" + osName);
    var toolsToInstall = [];
    var requiredSpace = 0 ;

    async.each(devToolsSpec.install, function(toolSpec, cb) {

        if ( (!toolSpec.platforms || toolSpec.platforms.indexOf(platform) != -1 ) &&
             (!toolSpec.os || toolSpec.os.indexOf(osName) != -1)) {

            var script = require("./" + toolSpec.script + "." + osName );
            //console.log("  version: "+ toolSpec.version);
            //console.log("  script: "+ script);
            script.check(toolSpec.version, toolSpec.opts, function( installOk ) {
                    if ( !installOk ) {
                        toolsToInstall.push(toolSpec);
                        requiredSpace += toolSpec.diskSpace;
                    }
                    cb();
                }
            );
        }
        else {
            cb();
        }
    }, function(err){
        if( err ) {
            callback(err);
        } else {
            checkEnoughSpace(requiredSpace, function(err) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, toolsToInstall);
                }
            });
        }
    });
}

/**
 * Check there is enough space on disk to install missing tools.
 * @param requiredSpace require free space.
 * @param callback callback
 */
function checkEnoughSpace(requiredSpace, callback) {

    console.log("required free space: " + requiredSpace + " Mo");

    config.get('devToolsBaseDir', function(err, baseDir) {
        if (err) {
            callback(err);
        }
        else {
            diskspace.check(baseDir, function (err, total, free, status)
            {
                if (err ) {
                    callback(err);
                }
                else {
                    if ( requiredSpace >= ( free / 1024/ 1024 ) ) {
                        callback("Not enough space. At least " + requiredSpace+ " Mo is needed.");
                    }
                    else {
                        callback();
                    }
                }
            });
        }
    })
}

/**
 * Download required packages of the tool.
 * @param missingToolSpecs tool install specification
 * @param callback
 */
function downloadPackages(missingToolSpec, callback) {

    config.get("devToolsBaseDir", function(err, baseDir) {
        if (err) {
            callback(err);
        }
        else {

            // base directory where to install products
            missingToolSpec.opts.devToolsBaseDir = baseDir;

            // install directory for this product
            missingToolSpec.opts.installDirname = missingToolSpec.name + '-' + missingToolSpec.version;
            missingToolSpec.opts.installDir = path.join(baseDir, missingToolSpec.opts.installDirname);

            // where to find packages
            missingToolSpec.opts.packageDir = path.join(system.userHome(), ".mdk", "cache", "packages");

            // create directories for packages if it does not exist.
            fs.ensureDir(missingToolSpec.opts.packageDir, function(err) {

                if ( err ) {
                    callback(err);
                }
                else {
                    // for each package
                    async.each(missingToolSpec.packages, function (packageToDownload, cb) {

                        // compute where the file is downloaded (in cache directory).
                        packageToDownload.cacheFile = path.join(missingToolSpec.opts.packageDir, packageToDownload.filename);

                        // check if we should download the file
                        shouldDownload(packageToDownload, function (err, doDownload) {

                            if ( err ) {
                                cb(err);
                            }
                            else {
                                if (doDownload) {

                                    var options = {};
                                    options.url = packageToDownload.url;
                                    if (packageToDownload.headers) {
                                        options.headers = packageToDownload.headers;
                                    }

                                    // download file
                                    console.log("  download file: " + packageToDownload.url + "...");
                                    network.downloadFile(options, packageToDownload.cacheFile, cb);
                                }
                                else {
                                    console.log("  no need to download file: " + packageToDownload.url);
                                    cb();
                                }
                            }
                        })
                    }, callback);
                }
            });
        }
    });
}

/**
 * Test if package should be download.
 * <p>A package must be download if :</p>
 * <ul>
 *     <li>it doesnot exists.<li>
 *     <li>checksum is bad.</li>
 * </ul>
 * @param callback
 */
function shouldDownload( packageToDownload, callback ) {

    fs.access( packageToDownload.cacheFile, fs.F_OK, function(err) {

        if ( err ) {
            // error, file must be downloaded.
            callback(null, true);
        }
        else {
            // file exists, check checksum
            checksum.file( packageToDownload.cacheFile, function (err, sum) {
                if (err) {
                    callback(err);
                }
                else {
                    //console.info("  computed checksum: " + sum);
                    //console.info("  valid checksum: " + packageToDownload.checksum);

                    if ( sum == packageToDownload.checksum) {
                        console.info("  file '" + packageToDownload.cacheFile + "' already in cache.");
                        callback(null, false);

                    }
                    else {
                        fs.remove(packageToDownload.cacheFile, function (err) {

                            console.warn("  !file '" + packageToDownload.cacheFile + "' is corrupt. Will download again.");
                            callback(null, true);

                        });
                    }
                }
            });
        }
    });
}

/**
 * Clean workdir.
 * <p>Delete all contents and recreate a new one.</p>
 * @param toolSpec install specification of tool
 * @param callback
 */
function cleanWorkDir( toolSpec, callback ) {
    // working directory
    toolSpec.opts.workDir = path.join(system.userHome(), ".mdk", "tmp");

    // remove work dir
    fs.remove( toolSpec.opts.workDir, function(err) {

        if ( err ) {
            callback(err);
        }
        else {
            // recreate workdir
            fs.mkdirs(toolSpec.opts.workDir, callback);
        }
    });
}

module.exports = install;
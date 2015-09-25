'use strict'

var async = require('async');
var path = require('path');
var semver = require('semver');
var diskspace = require('diskspace');
<<<<<<< HEAD
var checksum = require('checksum');
=======
>>>>>>> 14711a4c73bda8ef366957bca0a379ef860f4c7a
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
            system.isLinux(function (isWin) {callback('iOS is not supported on Linux platform')});
            break;
        case 'android':
            //Supported everwhere
            break;
        default:
            callback('Unrecognized platform : \'' + platform + '\'');
            break;
    }
    //system.isLinux
    //system.isMacOS
    //system.isWin
    callback();
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

    computeToolToInstall(devToolsSpecs, platform, osName, function(err, missingToolSpecs) {
        if ( err ) {
            callback(err);
        }
        else {
            if ( missingToolSpecs.length > 0 ) {
                console.log("missing tools: ", missingToolSpecs);
                async.each(missingToolSpecs, function(missingToolSpec, cb) {

                    var script = require("./" + missingToolSpec.script + "." + osName);
                    script.install(missingToolSpec.version, platform, cb);

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
function computeToolToInstall(devToolsSpec, platform, osName, callback ) {

    console.log("computeToolToInstall" );
    console.log("platform:" + platform);
    console.log("osName:" + osName);
    var toolsToInstall = [];
    var requiredSpace = 0 ;

    async.each(devToolsSpec.install, function(toolSpec, cb) {

        console.log("product: "+ toolSpec.name);
        if ( !toolSpec.platforms || toolSpec.platforms.contains(platform)) {

            var script = require("./" + toolSpec.script + "." + osName );
            console.log("  version: "+ toolSpec.version);
            console.log("  script: "+ script);
            script.check(toolSpec.version, toolSpec.opts, function( valid ) {
                    if ( !valid ) {
                        console.log("  valid: "+ valid);
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

module.exports = install;
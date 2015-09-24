'use strict'

var async = require('async');
var semver = require('semver');
var diskspace = require('diskspace');

var system = require('../../utils/system');
var devToolsSpecs = require('../specs');
var osName = require('../../utils/system/osName');
var config = require('../../config');

/**
 * Install tools required by mdk for platform.
 * @param platform platform target (android,ios)
 * @param mdkVersion mdk version
 * @param callback
 */
function install( platform, mdkVersion, callback ) {

    async.waterfall( [
        function (cb) {
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
            //TODO: check mdk-cli version >= devToolsVersion.mdk-cli.minVersion
            //use semver.gte
            cb(null, devToolsSpec, osName);
        },
        function(devToolsSpecs, osName, cb) {
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
    //TODO:
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
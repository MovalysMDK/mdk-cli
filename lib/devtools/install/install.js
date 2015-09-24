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
            installTools(devToolsSpecs, osName, cb);
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
 * @param callback
 */
function installTools(devToolsSpecs, platform, callback) {

    computeToolToInstall(devToolsSpecs, platform, function(err, missingToolSpecs) {
        if ( err ) {
            callback(err);
        }
        else {
            async.each(missingToolSpecs, function(missingToolSpec, cb) {

                var script = require("./" + missingToolSpec.script + ".js");
                script.install(missingToolSpec.version, platform, cb);

            }, callback);
        }
    });
}

/**
 *
 * @param devToolsSpec
 * @param platform
 * @param callback
 */
function computeToolToInstall(devToolsSpec, platform, callback ) {

    var toolsToInstall = [];
    var requiredSpace = 0 ;

    async.each(devToolsSpecs.install, function(toolSpec, cb) {

        if ( !toolSpec.platforms || toolSpec.platforms.contains(platform)) {

            var script = require("./" + toolSpec.script + ".js");
            script.check(toolSpec.version, platform, function( valid ) {
                    if ( !valid ) {
                        toolsToInstall.push(script);
                        requiredSpace += script.toolSize;
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
    config.get('devToolsBaseDir', function(err, baseDir) {
        if (err) {
            callback(err);
        }
        else {
            diskspace.check(baseDir, function (err, total, free, status)
            {
                console.log(baseDir);
                if ( requiredSpace >= ( free / 1024/ 1024 ) ) {
                    callback("Not enough space. At least " + requiredSpace+ " Mo is needed.");
                }
                else {
                    callback();
                }
            });
        }
    })
}

module.exports = install;
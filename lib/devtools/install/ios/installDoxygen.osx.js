"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var child_process = require('child_process');
var assert = require('assert');

var checkDoxygenVersion = require('../../check/ios/doxygen/checkDoxygenVersion');
var checkDoxygenFolder = require('../../check/ios/doxygen/checkDoxygenFolder');
var defineEnv = require('../../../platform/ios/doxygen/defineEnv');

var system = require('../../../utils/system/index');
var config = require('../../../config/index');

var uninstallDir = require('../common/uninstallDir');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec tool specification
     * @param devToolsSpec devtools specification
     * @param platform platform name
     * @param osName os name
     * @param callback callback
     */
    check: function( toolSpec, devToolsSpec, platform, osName, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof devToolsSpec, 'object');
        assert.equal(typeof platform, 'string');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        async.waterfall( [
            function (cb) {
                // read configuration to known where maven is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
            },
            function (installDir, cb) {
                if(typeof installDir === 'undefined') {
                    cb("Not installed");
                }
                else {
                    cb(null, installDir);
                }
            },
            function ( installDir, cb) {
                defineEnv(devToolsSpec, function(err) {
                    cb(err, installDir);
                });
            },
            function (installDir, cb) {
                checkDoxygenFolder( installDir, function(err) {
                    if (err) {
                        console.log("failed to check maven folder");
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check maven version
                checkDoxygenVersion( toolSpec.version, installDir, cb);
            }
        ], function(err) {
            if ( err ) {
                callback(false);
            }
            else {
                // all checks passed, don't need to reinstall
                callback(true);
            }
        });
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>delete old directory if exists</li>
     *     <li>install products in directory $MDK_HOME/tools/doxygen-version.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param callback callback
     */
    install: function( toolSpec, callback) {

        assert.equal(typeof callback, 'function');

        var installDir = toolSpec.opts.installDir;
        var dmgFile = toolSpec.packages[0];
        var extractedPkgDir = toolSpec.packages[0].opts.extractedPkgDir;
        var binaryLocation = toolSpec.packages[0].opts.binaryLocation;

        var binaryFilePath = path.join(toolSpec.packages[0].opts.osxVolumePath, extractedPkgDir, binaryLocation);
        var dmgMounted = false;

        async.waterfall([
            function(cb) {
                fs.access( toolSpec.packages[0].opts.osxVolumePath, fs.R_OK, function(err) {
                    if ( err ) {
                        console.log("  mount dmg file: " + dmgFile.cacheFile);
                        system.spawn('hdiutil', ['attach', dmgFile.cacheFile], function (err) {
                            if (!err) {
                                dmgMounted = true;
                            }
                            cb(err);
                        });
                    }
                    else {
                        console.log("  dmg already mounted: " + dmgFile.cacheFile);
                        dmgMounted = true;
                        cb();
                    }
                });
            },
            function(cb) {
                process.chdir(binaryFilePath);
                console.log("  copy files");
                fs.copy(toolSpec.name, path.join(installDir, 'bin', toolSpec.name), function (err) {
                    process.chdir(path.join("..",".."));
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                console.log("  remove file: " + extractedPkgDir);
                fs.remove(extractedPkgDir, cb);
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }

        ], function(err) {
            if ( dmgMounted ) {
                console.log("  unmount dmg file: " + toolSpec.packages[0].opts.osxVolumePath );
                // ignore error
                system.spawn('hdiutil', ['detach', toolSpec.packages[0].opts.osxVolumePath ], function(err) {});
            }

            callback(err);
        });
    },

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, removeDependencies, callback) {
        uninstallDir(toolSpec, removeDependencies, callback);
    }
};
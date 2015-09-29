"use strict"

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var zlib = require('zlib');
var child_process = require('child_process');
var assert = require('assert');

var checkDoxygenVersion = require('../../check/common/checkDoxygenVersion');
var checkDoxygenFolder = require('../../check/common/checkDoxygenFolder');

var system = require('../../../utils/system');
var config = require('../../../config');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec toolSpec
     * @param callback callback
     */
    check: function( toolSpec, callback ) {

        assert.equal(typeof toolSpec, 'object');
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
                console.log("error : "+ err);
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
         *     <li>install products in directory config.get("devToolsBaseDir") + toolName + toolVersion.</li>
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
            console.log("toolSpec.packages[0].opts.osxVolumePath : ", toolSpec.packages[0].opts.osxVolumePath);
            console.log("binaryLocation : ", binaryLocation);
            console.log("extractedPkgDir : ", extractedPkgDir);

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
        }
    };
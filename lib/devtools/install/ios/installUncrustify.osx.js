"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var child_process = require('child_process');
var assert = require('assert');
var io = require('../../../utils/io');

var checkUncrustifyVersion = require('../../check/ios/uncrustify/checkUncrustifyVersion');
var checkUncrustifyFolder = require('../../check/ios/uncrustify/checkUncrustifyFolder');

var system = require('../../../utils/system');
var config = require('../../../config');

var uninstallDir = require('../common/uninstallDir');


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
                checkUncrustifyFolder(installDir, function(err) {
                    if (err) {
                        console.log("failed to check uncrustify folder");
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check uncrustify version
                checkUncrustifyVersion( toolSpec.version, installDir, cb);
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
     *     <li>install products in directory config.get("devToolsBaseDir") + toolName + toolVersion.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param callback callback
     */
    install: function( toolSpec, callback) {

        var installDir = toolSpec.opts.installDir;
        var zipFilename = toolSpec.packages[0].filename;
        var zipFile = toolSpec.packages[0].cacheFile;


        async.waterfall([
            function(cb) {
                console.log("  extract zip: " + zipFile);
                process.chdir(toolSpec.opts.workDir);
                system.spawn('unzip', [zipFile,'-d', toolSpec.name +'-'+ toolSpec.version], function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                console.log("  configure: " + toolSpec.name);
                process.chdir(path.join(toolSpec.name +'-'+ toolSpec.version, 'uncrustify-uncrustify-0.61'));
                var configureFile = path.join(process.cwd(), 'configure');
                system.spawn(configureFile, [], function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },

            function(cb) {
                console.log("  prepare: " + toolSpec.name + ' to install');
                process.chdir(toolSpec.packages[0].opts.binaryLocation);
                io.replaceInFile (toolSpec.packages[0].opts.versionFileNameToFix, toolSpec.packages[0].opts.baseVersionName, toolSpec.packages[0].opts.fixedVersionName, cb);
            },
            function(cb) {
                console.log("  make: " + toolSpec.name);
                process.chdir('..');
                system.spawn('make', [],  function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                console.log("  copy files");
                process.chdir(toolSpec.packages[0].opts.binaryLocation);
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
                console.log("  remove file: " + zipFilename);
                fs.remove(zipFilename, cb);
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }

        ], function(err) {
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
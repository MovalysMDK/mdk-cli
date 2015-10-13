"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var io = require('../../../utils/io');

var checkXctoolVersion = require('../../check/ios/xctool/checkXctoolVersion');
var checkXctoolFolder = require('../../check/ios/xctool/checkXctoolFolder');
var defineEnv = require('../../../platform/ios/xctool/defineEnv');

var system = require('../../../utils/system');
var config = require('../../../config');
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
    check: function (toolSpec, devToolsSpec, platform, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof devToolsSpec, 'object');
        assert.equal(typeof platform, 'string');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        async.waterfall([
            function (cb) {
                // read configuration to known where xctool is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
            },
            function (installDir, cb) {
                if (typeof installDir === 'undefined') {
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
                checkXctoolFolder(installDir, function (err) {
                    if (err) {
                        console.log("failed to check xctool folder");
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check xctool version
                checkXctoolVersion(toolSpec.version, installDir, cb);
            }
        ], function (err) {
            if (err) {
                callback(false, err);
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
    install: function (toolSpec, callback) {

        var installDir = toolSpec.opts.installDir;
        var zipFilename = toolSpec.packages[0].filename;
        var zipFile = toolSpec.packages[0].cacheFile;

        async.waterfall([
            function (cb) {
                process.chdir(toolSpec.opts.workDir);
                console.log("  extract zip: " + zipFile);
                system.spawn('unzip', [zipFile, '-d', toolSpec.name + '-' + toolSpec.version], function (err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },

            function (cb) {
                console.log("  copy " + toolSpec.name);
                fs.copy(toolSpec.name + '-' + toolSpec.version, installDir, function (err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function (cb) {
                console.log("  remove file: " + zipFilename);
                fs.remove(zipFilename, cb);
            },
            function (cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }

        ], function (err) {
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
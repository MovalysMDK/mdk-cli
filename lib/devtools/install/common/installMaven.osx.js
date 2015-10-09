"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var moment = require('moment');

var checkMavenVersion = require('../../check/common/maven/checkMavenVersion');
var checkMavenFolder = require('../../check/common/maven/checkMavenFolder');

var system = require('../../../utils/system');
var config = require('../../../config');
var uninstallDir = require('./uninstallDir');

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
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                    if (err || typeof installDir === 'undefined') {
                        cb("Not installed");
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                checkMavenFolder( installDir, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check maven version
                checkMavenVersion( toolSpec.version, installDir, cb);
            }
        ], function(err) {
            if ( err ) {
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
    install: function( toolSpec, callback) {

        var installDir = toolSpec.opts.installDir;
        var zipFilename = toolSpec.packages[0].filename;
        var zipFile = toolSpec.packages[0].cacheFile;
        var confDir = path.join(system.userHome(), ".mdk", "conf");
        var settingsOrig = path.join( __dirname, "settings-template.xml");
        var settingsTo = path.join(confDir, "settings-template.xml");

        async.waterfall([
            function(cb) {
                process.chdir(toolSpec.opts.workDir);
                console.log("  extract zip: " + zipFile);
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
                process.chdir(toolSpec.name +'-'+ toolSpec.version);
                console.log("  copy files");
                fs.copy(toolSpec.name +'-'+ toolSpec.version, installDir, function (err) {
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
            },
            function(cb) {
                // create ~/.mdk/tools/conf
                fs.ensureDir(confDir, function(err) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                // if "settings-template.xml" already exists, make a backup.
                fs.access(settingsTo, fs.W_OK, function(err) {
                    if ( !err) {
                        fs.copy(settingsTo, settingsTo + "." + moment(new Date()).format('YYYYMMDD-HHmmss'), function (err) {
                            cb(err);
                        });
                    }
                    else {
                        cb();
                    }
                });
            },
            function (cb) {
                // copy settings.xml in conf directory.
                fs.copy(settingsOrig, settingsTo, function (err) {
                    cb(err);
                });
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
"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var moment = require('moment');

var checkMavenVersion = require('../../check/common/maven/checkMavenVersion');
var checkMavenFolder = require('../../check/common/maven/checkMavenFolder');
var defineEnv = require('../../../platform/common/maven/defineEnv');

var mdkpath = require('../../../mdkpath');
var system = require('../../../utils/system');
var extract = require('adm-zip');
var config = require('../../../config');
var uninstallDir = require('./uninstallToolDir');

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
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                    if (err || typeof installDir === 'undefined') {
                        cb("Not installed");
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function ( installDir, cb) {
                defineEnv(devToolsSpec, osName, platform, function(err) {
                    cb(err, installDir);
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
     *     <li>install products in directory $MDK_HOME/tools/apache-maven-version.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param osName os name
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        var mdkPaths = mdkpath();
        var installDir = toolSpec.opts.installDir;
        var archiveFilename = toolSpec.packages[0].filename;
        var archiveFile = toolSpec.packages[0].cacheFile;
        var settingsOrig = path.join( __dirname, "settings-template.xml");
        var settingsTo = path.join(mdkPaths.confDir, "settings-template.xml");

        async.waterfall([
            function(cb) {
                process.chdir(toolSpec.opts.workDir);

                var targetDirectory = toolSpec.name +'-'+ toolSpec.version;

                console.log("  extract archive: " + archiveFile);
                // reading archives
                var zip = new AdmZip(archiveFile);
                // extracts everything
                zip.extractAllTo(targetDirectory, true);
                cb();
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
                console.log("  remove file: " + archiveFilename);
                fs.remove(archiveFilename, cb);
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            },
            function(cb) {
                // create ~/.mdk/tools/conf
                fs.ensureDir(mdkPaths.confDir, function(err) {
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
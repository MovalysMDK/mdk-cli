"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var mustache = require('mustache');

var checkAndroidSdkFolder = require('../../check/android/sdk/checkAndroidSdkFolder');

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
                // check maven version
                checkAndroidSdkFolder(installDir, cb);
            }

        ], function(err) {
            if ( err ) {
                callback(false, err);
            }
            else {
                // all checks passed but return false to search for updates.
                callback(false, "update");
            }
        });
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>install products in directory config.get("devToolsBaseDir") + "android-sdk".</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param callback callback
     */
    install: function( toolSpec, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof callback, 'function');

        // update installDir to remove version number in directory name.
        toolSpec.opts.installDir = path.dirname(toolSpec.opts.installDir);
        toolSpec.opts.installDir = path.join(toolSpec.opts.installDir, toolSpec.name);

        var installDir = toolSpec.opts.installDir;
        var zipFilename = toolSpec.packages[0].filename;
        var zipFile = toolSpec.packages[0].cacheFile;
        var confDir = path.join(system.userHome(), ".mdk", "conf");

        var installAndroidSdk = require("./installAndroidSdk.osx");

        async.waterfall([
            function(cb) {
                installAndroidSdk.extractZip(zipFile, toolSpec, cb);
            },
            function(cb) {
                installAndroidSdk.updateSdk(toolSpec, cb);
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
            }
        ], function(err) {
            callback(err);
        });
    },

    /**
     * Extract zip file if directory android-sdk does not exist.
     * @param toolSpec toolSpec
     * @param callback callback
     */
    extractZip: function(zipFile, toolSpec, callback) {

        assert.equal(typeof zipFile, 'string');
        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof callback, 'function');

        checkAndroidSdkFolder( toolSpec.opts.installDir, function(err) {
            if (err) {
                process.chdir(toolSpec.opts.devToolsBaseDir);
                console.log("  extract zip: " + zipFile);
                system.spawn('unzip', [zipFile,'-d', toolSpec.opts.devToolsBaseDir], function (err ) {
                    if ( err) {
                        callback(err);
                    }
                    else {
                        fs.move("android-sdk-macosx", toolSpec.opts.installDir, callback);
                    }
                });
            }
            else {
                callback();
            }
        });
    },

    /**
     * Update Android SDK
     * @param toolSpec tool spec
     * @param callback callback
     */
    updateSdk: function(toolSpec, callback) {

        var installAndroidSdk = require("./installAndroidSdk.osx");
        installAndroidSdk.createInstallScript(toolSpec, function(err, installScript) {

            if ( err) {
                callback(err);
            }
            else {

                var cmd = spawn(installScript, [], { encoding: 'utf8', stdio: 'pipe' } );
                cmd.stderr.pipe(process.stderr);
                cmd.stdout.pipe(process.stdout);

                cmd.on('close', function (code) {

                    // delete install script
                    fs.remove(installScript);

                    if (code !== 0) {
                        callback('Android SDK Update failed: '+ installScript );
                    }
                    else {
                        callback();
                    }
                });
            }
        });
    },

    /**
     * Genere update script for sdk
     * @param toolSpec
     * @param callback
     */
    createInstallScript: function(toolSpec, callback) {

        //TODO: check API, support, build-tools, Android SDK Tools
        //--proxy-host, --proxy-port

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof callback, 'function');

        var installScriptTemplateFile = path.join( __dirname, "installSdk.template.sh");
        var installScriptFile = path.join( toolSpec.opts.workDir, "installSdk.sh");

        // compute filter for android sdk update.
        var filter = "tool,platform-tool,extra-android-support,extra-android-m2repository,extra-google-google_play_services,extra-google-m2repository";

        // add api to filter
        var apiCount = toolSpec.packages[0].opts.api.length;
        for (var i = 0; i < apiCount; i++) {
            filter += ",android-" + toolSpec.packages[0].opts.api[i] ;
        }

        // add build tools to filter
        filter += ",build-tools-" + toolSpec.packages[0].opts.buildTools ;

        var androidCmd = path.join(toolSpec.opts.installDir, "tools", "android") + " update sdk -u --filter "+ filter;

        var objects = {
            cmd: androidCmd
        };

        async.waterfall([
            function(cb) {
                // load template of install script
                fs.readFile(installScriptTemplateFile, 'utf8', function(err, installScriptTemplateContent) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, installScriptTemplateContent);
                    }
                });
            },
            function(installScriptTemplateContent, cb) {
                var settingsContent = mustache.render( installScriptTemplateContent, objects);
                fs.writeFile(installScriptFile, settingsContent, function(err) {
                    cb(err, installScriptFile);
                });
            },
            function(installScriptFile, cb ) {
                // add exec permissions
                fs.chmod(installScriptFile, 500, function(err) {
                    cb(err,installScriptFile);
                });
            }
        ], function(err, installScriptFile){
                callback(err, installScriptFile);
        });
    },

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, callback) {
        //uninstall(toolSpec, callback);
    }
};
"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var mustache = require('mustache');
var spawn = require('child_process').spawn;

var checkAndroidSdkFolder = require('../../check/android/sdk/checkAndroidSdkFolder');
var checkAndroidBuildTools = require('../../check/android/sdk/checkAndroidBuildTools');
var checkAndroidApi = require('../../check/android/sdk/checkAndroidApi');
var defineEnv = require('../../../platform/android/sdk/defineEnv');

var system = require('../../../utils/system');
var config = require('../../../config');

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
                // check android sdk folder
                checkAndroidSdkFolder(installDir, function(err ) {
                    if (err || typeof installDir === 'undefined') {
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check platform api are installed.
                checkAndroidApi(installDir, toolSpec, function(err ) {
                    if (err || typeof installDir === 'undefined') {
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check build tools are installed.
                checkAndroidBuildTools(installDir, toolSpec, function(err ) {
                    if (err || typeof installDir === 'undefined') {
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
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

        var installAndroidSdk = require("./installAndroidSdk.osx");

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

        var androidCmd = path.join(toolSpec.opts.installDir, "tools", "android");
        var androidCmdInstallMain = androidCmd + " update sdk -u --filter "+ filter;

        var objects = {
            cmd: androidCmdInstallMain
        };

        async.waterfall([
            function(cb) {
                // compute list of sdk packages
                installAndroidSdk.listSDKComponents(toolSpec, cb);
            },
            function (componentList, cb) {
                // check if build tools is already installed.
                installAndroidSdk.isBuildToolInstalled(toolSpec.packages[0].opts.buildTools,
                    toolSpec.opts.installDir, function(err, isInstalled) {
                    cb(null, isInstalled, componentList);
                });
            },
            function (isInstalled, componentList, cb) {

                if ( isInstalled === false ) {
                    // if not installed, compute command to install build tools.
                    var buildToolId = installAndroidSdk.findBuildToolId(componentList, toolSpec.packages[0].opts.buildTools);

                    if (buildToolId === -1) {
                        cb("Can't find Android SDK Build-tools version " + toolSpec.packages[0].opts.buildTools);
                    }
                    else {

                        // add build tools to filter
                        // separate commands for build tools because it doesnot work with name and --all (install too many things).
                        objects.cmdBuildTools = androidCmd + " update sdk -u --all --filter " + buildToolId;
                        cb();
                    }
                }
                else {
                    cb();
                }
            },
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
                // generate script content.
                var scriptContent = mustache.render( installScriptTemplateContent, objects);

                // write script to disk.
                fs.writeFile(installScriptFile, scriptContent, function(err) {
                    cb(err, installScriptFile);
                });
            },
            function(installScriptFile, cb ) {
                // add exec permissions on script file.
                fs.chmod(installScriptFile, '0500', function(err) {
                    cb(err,installScriptFile);
                });
            }
        ], function(err, installScriptFile){
                callback(err, installScriptFile);
        });
    },

    /**
     * Get list of all sdk components
     * @param toolSpec androidsdk tool spec
     * @param callback callback
     */
    listSDKComponents: function(toolSpec, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof callback, 'function');

        var androidCmd = path.join(toolSpec.opts.installDir, "tools", "android");
        var androidArgs = ["list", "sdk", "-u", "--all"];

        system.spawn(androidCmd, androidArgs, function(err, stdout) {
            if ( err) {
                callback(err);
            }
            else {
                var str = stdout.toString(), lines = str.split(/(\r?\n)/g);
                var line;
                var index;
                var listComponents = [];
                for (var i = 0; i < lines.length; i++) {
                    line = lines[i];
                    if (index !== -1) {
                        listComponents.push(line);
                    }
                }
                callback(null, listComponents);
            }
        });
    },

    /**
     * Test if build tools is already installed.
     * @param version buildtools version
     * @param callback callback
     */
    isBuildToolInstalled: function( version, installDir, callback ) {

        var buildToolSourceFile = path.join(installDir, "build-tools", version, "source.properties");
        fs.access( buildToolSourceFile, fs.F_OK, function(err) {
            if (err) {
                callback(null, false);
            }
            else {
                callback(null, true);
            }
        });
    },

    /**
     * Find matching id to install buildtools in specified version.
     * @param list components of android sdk
     * @param buildToolVersion build tool version to install
     * @returns {number} component id
     */
    findBuildToolId: function(list, buildToolVersion) {

        var buildToolId = -1 ;
        for( var i = 0 ; i < list.length; i++ ) {
            var item = list[i];
            if ( item.indexOf("Android SDK Build-tools") !== -1 &&
                item.indexOf(buildToolVersion) !== -1 ) {
                buildToolId = item.split("-")[0].replace(/ /g,'');
                break;
            }
        }

        return buildToolId ;
    },

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, callback) {
        //nothing to do because it's really a big package and we can't force
        //users to redownload everything.
    }
};
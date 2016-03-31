/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var mustache = require('mustache');
var spawn = require('child_process').spawn;
var AdmZip = require('adm-zip');
var clc = require('cli-color');
var url = require('url');
var suppose = require('suppose');

var checkAndroidSdkFolder = require('../../check/android/sdk/checkAndroidSdkFolder');
var checkAndroidBuildTools = require('../../check/android/sdk/checkAndroidBuildTools');
var checkAndroidApi = require('../../check/android/sdk/checkAndroidApi');
var defineEnv = require('../../../platform/android/sdk/defineEnv');
var mdkpath = require('../../../mdkpath');

var system = require('../../../utils/system');
var network = require('../../../utils/network');
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
                checkAndroidSdkFolder(installDir, osName, function(err ) {
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
                if (toolSpec.commandOptions.updateAndroidSDK) {
                    // all checks passed but return false to search for updates.
                    callback(false, "update");
                }
                else {
                    callback(true);
                }
            }
        });
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>install products in directory $MDK_HOME/tools/android-sdk".</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param osName osName
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        // update installDir to remove version number in directory name.
        toolSpec.opts.installDir = path.dirname(toolSpec.opts.installDir);
        toolSpec.opts.installDir = path.join(toolSpec.opts.installDir, toolSpec.name);

        var zipFile = osName === "osx" ? toolSpec.packages[0].cacheFile : toolSpec.packages[1].cacheFile;
        var confDir = mdkpath().cacheDir;

        var installAndroidSdk = require("./installAndroidSdk");

        async.waterfall([
            function(cb) {
                installAndroidSdk.extractZip(zipFile, toolSpec, osName, cb);
            },
            function(cb) {
                installAndroidSdk.updateSdk(toolSpec, osName, cb);
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
     * @param zipFile zipFile
     * @param toolSpec toolSpec
     * @param osName os name
     * @param callback callback
     */
    extractZip: function(zipFile, toolSpec, osName, callback) {

        assert.equal(typeof zipFile, 'string');
        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        async.waterfall([
            function(cb) {

                checkAndroidSdkFolder( toolSpec.opts.installDir, osName, function(err) {
                    // continue waterfall if err, else stop
                    if (err) {
                        cb();
                    }
                    else {
                        cb("skipExtract");
                    }
                });
            },
            function(cb) {
                console.log("  extract zip: " + zipFile);
                process.chdir(toolSpec.opts.devToolsBaseDir);
                var zip = new AdmZip(zipFile);
                zip.extractAllTo(toolSpec.opts.workDir, /*overwrite*/true);
                var fromDir = path.join(toolSpec.opts.workDir, osName === "osx" ? "android-sdk-macosx" :"android-sdk-windows");

                console.log("  move files to install directory");
                fs.move(fromDir, toolSpec.opts.installDir, {clobber:true}, function(moveErr) {
                    cb(moveErr);
                });
            },
            function(cb) {
                // add exec permissions on android command.
                if ( osName === "osx") {
                    var androidCmd = path.join(toolSpec.opts.installDir, "tools", "android");
                    fs.chmod(androidCmd, "755", cb);
                }
                else {
                    cb();
                }
            }
        ], function(err) {
            if ( typeof err === "string" && err === "skipExtract")  {
                console.log("  ignore zip extract, android-sdk already exists.");
                callback();
            }
            else {
                callback(err);
            }
        });
    },

    /**
     * Update Android SDK
     * @param toolSpec tool spec
     * @param osName os name
     * @param callback callback
     */
    updateSdk: function(toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        var installAndroidSdk = require("./installAndroidSdk");

        async.waterfall([
                function(cb) {
                    network.findProxy(function(err, proxy) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            var proxyInfo = {};
                            if ( typeof proxy !== "undefined") {

                                var proxyParse = url.parse(proxy);

                                proxyInfo.proxyActive = true ;
                                if ( proxyParse.protocol ) {
                                    proxyInfo.proxyProtocol = proxyParse.protocol.replace(':','');
                                }
                                proxyInfo.proxyHostname = proxyParse.hostname ;
                                proxyInfo.proxyPort = proxyParse.port ;
                                if ( proxy.auth ) {
                                    var index = proxy.auth.indexOf(':');
                                    if (index !== -1) {
                                        proxyInfo.proxyUsername = proxy.auth.substr(0, index);
                                        proxyInfo.proxyPassword = proxy.auth.substr(index + 1);
                                    }
                                }
                            }
                            cb(null, proxyInfo);
                        }
                    });
                },
                function(proxyInfo, cb) {

                    console.log("  generate install commands.");

                    installAndroidSdk.getInstallCmds(toolSpec, osName, proxyInfo, function(err, cmdObject) {
                        if ( err) {
                            cb(err);
                        }
                        else {
                            cb(null, cmdObject);
                        }
                    });
                },
                function(cmdObject, cb) {

                    console.log("  run install.");
                    
                    if (cmdObject) {
                        suppose(cmdObject.cmd, cmdObject.params, {debug : true})
                            .when("[y/n]: ").respond("y")
                            .when("[y/n]: ").respond("y")
                            .when("[y/n]: ").respond("y")
                            .when("[y/n]: ").respond("y")
                            .on('error', function(err)  {
                                console.log(err.message);
                            })
                            .end(function(code) {
                                if (code !== 0) {
                                    cb('Android SDK Update failed: '+ cmdObject.cmd );
                                }
                                else {
                                    if (cmdObject.buildToolsParams) {
                                        suppose(cmdObject.cmd, cmdObject.buildToolsParams, {debug : true})
                                            .when("[y/n]: ").respond("y")
                                            .when("[y/n]: ").respond("y")
                                            .when("[y/n]: ").respond("y")
                                            .when("[y/n]: ").respond("y")
                                            .on('error', function(err)  {
                                                console.log(err.message);
                                            })
                                            .end(function(code) {
                                                if (code !== 0) {
                                                    cb('Android SDK Update failed: '+ cmdObject.cmd );
                                                }
                                                else {
                                                    cb();
                                                }
                                            });
                                    }
                                }
                            });
                    }
                }
            ],
            function(err){
                callback(err);
            });


    },
    
    
    /**
     * Generate update commands to use for sdk installation
     * @param toolSpec toolspec
     * @param osName os name
     * @param proxyInfo proxy info
     * @param callback callback
     */
    getInstallCmds: function(toolSpec, osName, proxyInfo, callback) {

        var installAndroidSdk = require("./installAndroidSdk");

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof proxyInfo, 'object');
        assert.equal(typeof callback, 'function');

        // compute filter for android sdk update.
        var filter = "tool,platform-tool,extra-android-support,extra-android-m2repository,extra-google-google_play_services,extra-google-m2repository";

        // add api to filter
        var apiCount = toolSpec.opts.api.length;
        for (var i = 0; i < apiCount; i++) {
            filter += ",android-" + toolSpec.opts.api[i] ;
        }

        // 
        var androidCmdInstallMain = path.join(toolSpec.opts.installDir, "tools", system.computeCommand('android', osName, false, {"win":"bat"}));
        var androidCmdInstallParams = ["update", "sdk", "-u", "--filter", filter];

        var objects = {
            cmd: androidCmdInstallMain,
            params: androidCmdInstallParams
        };

        async.waterfall([
            function(cb) {
                // compute list of sdk packages
                installAndroidSdk.listSDKComponents(toolSpec, proxyInfo, cb);
            },
            function (componentList, cb) {

                // check if build tools is already installed.
                installAndroidSdk.isBuildToolInstalled(toolSpec.opts.buildTools,
                    toolSpec.opts.installDir, function(err, isInstalled) {
                        cb(null, isInstalled, componentList);
                    });
            },
            function (isInstalled, componentList, cb) {

                if ( isInstalled === false ) {
                    // if not installed, compute command to install build tools.
                    var buildToolId = installAndroidSdk.findBuildToolId(componentList, toolSpec.opts.buildTools);

                    if (buildToolId === -1) {
                        cb("Can't find Android SDK Build-tools version " + toolSpec.opts.buildTools);
                    }
                    else {
                        // add build tools to filter
                        // separate commands for build tools because it doesnot work with name and --all (install too many things).
                        objects.buildToolsParams = ["update", "sdk", "-u", "--all", "--filter", buildToolId];
                        cb(null, objects);
                    }
                }
                else {
                    cb(null, objects);
                }
            },
            function (objects, cb) {
                if ( typeof proxyInfo.proxyHostname !== "undefined" ) {
                    objects.params.push("--proxy-host");
                    objects.params.push(proxyInfo.proxyHostname);
                    if (objects.buildToolsParams) {
                        objects.buildToolsParams.push("--proxy-host");
                        objects.buildToolsParams.push(proxyInfo.proxyHostname);
                    }
                }
                if ( typeof proxyInfo.proxyPort !== "undefined" ) {
                    objects.params.push("--proxy-port");
                    objects.params.push(proxyInfo.proxyPort);
                    if (objects.buildToolsParams) {
                        objects.buildToolsParams.push("--proxy-port");
                        objects.buildToolsParams.push(proxyInfo.proxyPort);
                    }
                }
                
                cb(null, objects);
            }
        ], function(err, cmdObject){
            callback(err, cmdObject);
        });
    },

    /**
     * Get list of all sdk components
     * @param toolSpec androidsdk tool spec
     * @param proxyInfo proxy info
     * @param callback callback
     */
    listSDKComponents: function(toolSpec, proxyInfo, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof proxyInfo, 'object');
        assert.equal(typeof callback, 'function');

        var androidCmd = path.join(toolSpec.opts.installDir, "tools", "android");
        var androidArgs = ["list", "sdk", "-u", "--all"];

        if ( typeof proxyInfo.proxyHostname !== "undefined" ) {
            androidArgs.push("--proxy-host");
            androidArgs.push(proxyInfo.proxyHostname );
        }
        if ( typeof proxyInfo.proxyPort !== "undefined" ) {
            androidArgs.push("--proxy-port");
            androidArgs.push(proxyInfo.proxyPort );
        }

        system.spawn(androidCmd, androidArgs, function(err, stdout) {

            if ( err) {
                callback(err);
            }
            else {
                var str = stdout.toString();
                var lines = str.split(/\r?\n/g);
                var line;
                var listComponents = [];
                for (var i = 0; i < lines.length; i++) {
                    line = lines[i];
                    if ( line !== "") {
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
    uninstall: function( toolSpec, removeDependencies, callback) {
        //nothing to do because it's really a big package and we can't force
        //users to redownload everything.
    }
};
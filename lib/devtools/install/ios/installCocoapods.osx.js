"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var url = require("url");
var mustache = require('mustache');

var checkCocoapodsVersion = require('../../check/ios/cocoapods/checkCocoapodsVersion');
var checkCocoapodsFolder = require('../../check/ios/cocoapods/checkCocoapodsFolder');

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
                // read configuration to known where cocoapods is installed.
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
                checkCocoapodsFolder( installDir, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check cocoapods version
                checkCocoapodsVersion( toolSpec.version, installDir, cb);
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

        var installBinDir = path.join(toolSpec.opts.installDir, toolSpec.opts.binDirectory);
        var installLibDir = path.join(toolSpec.opts.installDir, toolSpec.opts.libDirectory);

        async.waterfall([
            function(cb) {
                fs.ensureDir(toolSpec.opts.installDir, cb);
            },
            function(installDir, cb) {
                console.log("  Installing cocoapods");
                system.spawn('gem', ['install', toolSpec.name, '-v', toolSpec.version, '-n', installBinDir, "-i", installLibDir], function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
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


        var tmpDir = toolSpec.opts.workDir;
        var tmpGemConfigurationFile = path.join(tmpDir, 'gem-' + toolSpec.name + '.conf');
        var originalGemConfigurationFile = path.join(__dirname, 'gemConf', 'gem.conf');

        async.waterfall([
            function (cb) {
                // read configuration to known where cocoapods is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, value) {
                    if(typeof value === 'undefined') {
                        cb("Unable to retrieve " + toolSpec.name +  " install directory");
                    }
                    else {
                        cb(err, value);
                    }
                });
            },
            function(installDir, cb) {
                fs.copy(originalGemConfigurationFile, tmpGemConfigurationFile, function (err) {
                    cb(null, installDir);
                });
            },
            function(installDir,  cb) {
                var configKeys = ["mdk_login", "mdk_password", "mdkRepoGemsRelease"];
                config.getList(configKeys, function(err, objects) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, objects, installDir);
                    }
                });
            },
            function(objects, installDir, cb) {
                fs.readFile(originalGemConfigurationFile, 'utf8', function(err, settingsTemplateContent) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, settingsTemplateContent, objects, installDir);
                    }
                });
            },
            function(settingsTemplateContent, objects, installDir, cb) {
                var str = url.parse(objects.mdkRepoGemsRelease);
                str.auth = objects.mdk_login+':'+objects.mdk_password;
                objects.mdkRepoGemsRelease = url.format(str);
                objects.mdkGemHome = process.env.GEM_HOME;
                var settingsContent = mustache.render( settingsTemplateContent, objects);
                fs.writeFile(tmpGemConfigurationFile, settingsContent, function(err) {
                    cb(err, installDir);
                });
            },
            function(installDir, cb) {
                var installBinDir = path.join(installDir, toolSpec.opts.binDirectory);
                var installLibDir = path.join(installDir, toolSpec.opts.libDirectory);
                console.log(removeDependencies);
                system.spawn('gem', ['uninstall', toolSpec.name, '-v', toolSpec.version, '-n', installBinDir, "-i", installLibDir,
                    '--config-file', tmpGemConfigurationFile, removeDependencies ? '--ignore-dependencies': '' ], function (err ) {
                    cb(err, installDir);
                });
            },
            function(installDir, cb) {
                //Remove installVersion conf file
                var installVersionFile = path.join(installDir, toolSpec.name+"-"+toolSpec.version+".installVersion");
                fs.remove(installVersionFile, cb);
            },
            function(cb) {
                //Remove temp conf file
                fs.remove(tmpGemConfigurationFile, cb);
            },
            function(cb) {
                // save install directory in config
                config.del("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
            }

        ], function(err) {
            callback(err);

        });
    }
};
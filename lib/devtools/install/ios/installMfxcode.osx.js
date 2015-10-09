"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var url = require("url");

var checkMfxcodeVersion = require('../../check/ios/mfxcode/checkMfxcodeVersion');
var checkMfxcodeFolder = require('../../check/ios/mfxcode/checkMfxcodeFolder');

var system = require('../../../utils/system');
var config = require('../../../config');
var askCredentials = require('../../../user');
var uninstallGem = require('../common/uninstallGem');
var mustache = require('mustache');

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
                // read configuration to known where mfxcode is installed.
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
                checkMfxcodeFolder( installDir, function(err) {
                    if (err) {
                        console.log("failed to check mfxcode folder");
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check mfxcode version
                checkMfxcodeVersion( toolSpec.version, installDir, cb);
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


        var originalGemConfigurationFile = path.join(__dirname, 'gemConf', 'gem.conf');
        var tmpDir = toolSpec.opts.workDir;
        var tmpGemConfigurationFile = path.join(tmpDir, 'gem-' + toolSpec.name + '.conf');

        var installBinDir = path.join(toolSpec.opts.installDir, toolSpec.opts.binDirectory);
        var installLibDir = path.join(toolSpec.opts.installDir, toolSpec.opts.libDirectory);


        async.waterfall([
            function(cb) {
                getMdkCredentials(function (err, mdkLogin, mdkPassword) {
                    cb (err, mdkLogin, mdkPassword);
                });
            },
            function(login, password, cb) {
                console.log("  Copy temporary installation files");
                fs.copy(originalGemConfigurationFile, tmpGemConfigurationFile, function (err) {
                    if (err) {
                        cb(err, login, password);
                    }
                    else {
                        cb(null, login, password);
                    }
                });
            },
            function(login, password, cb) {
                var configKeys = ["mdk_login", "mdk_password", "mdkRepoGemsRelease"];
                config.getList(configKeys, function(err, objects) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, objects, login, password);
                    }
                });
            },
            function(objects, login, password, cb) {
                fs.readFile(originalGemConfigurationFile, 'utf8', function(err, settingsTemplateContent) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, settingsTemplateContent, objects, login, password);
                    }
                });
            },
            function(settingsTemplateContent, objects, login, password, cb) {
                console.log("  Configure temporary installation files");
                var str = url.parse(objects.mdkRepoGemsRelease);
                str.auth = objects.mdk_login+':'+objects.mdk_password;
                objects.mdkRepoGemsRelease = url.format(str);
                objects.mdkGemHome = process.env.GEM_HOME;
                var settingsContent = mustache.render( settingsTemplateContent, objects);
                fs.writeFile(tmpGemConfigurationFile, settingsContent, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function (cb) {
                console.log("  Install mfxcode");
                system.spawn('gem', ['install', toolSpec.name, '-v', toolSpec.version, '-n', installBinDir, '-i', installLibDir, '--config-file', tmpGemConfigurationFile], function (err ) {
                    cb(err);
                });
            },
            function(cb) {
                //Remove temp conf file
                console.log("  remove temporary installation file");
                fs.remove(tmpGemConfigurationFile, cb);
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }
        ], function(err) {
            if (err) {
                console.log("ERROR : ", err);
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
        uninstallGem(toolSpec, removeDependencies, callback);
    }
};





function getMdkCredentials(callback) {

    async.waterfall( [
        function (cb) {
            // read configuration to get mdk login
            config.get("mdk_login", function(err, mdkLogin) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, mdkLogin);
                }
            });
        },
        function (mdkLogin, cb) {
            // read configuration to get mdk password
            config.get("mdk_password", function(err, mdkPassword) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, mdkLogin, mdkPassword);
                }
            });
        },
        function (mdkLogin, mdkPassword, cb) {
            //Check or prompt MDK credentials
            if(!mdkLogin || !mdkPassword || (typeof mdkLogin === undefined) || (typeof  mdkPassword === undefined)) {
                askCredentials.askCredentials(function (err, login, password) {
                    if(err) {
                        cb(err);
                    }
                    else {
                        cb(null, login, password);
                    }
                });
            }
            else {
                cb(null, mdkLogin, mdkPassword);
            }
        },
    ], function(err, mdkLogin, mdkPassword) {
        callback(null, mdkLogin, mdkPassword);
    });
}
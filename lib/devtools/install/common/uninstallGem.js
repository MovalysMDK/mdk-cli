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
'use strict';

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var url = require("url");
var mustache = require("mustache");
var config = require('../../../config');
var system = require('../../../utils/system');

/**
 * Remove tool
 * @param toolSpec toolSpec
 * @param removeDependencies Indicates if dependencies should be removed too
 * @param callback callback
 */
function uninstallGem ( toolSpec, removeDependencies, callback) {

    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof removeDependencies, 'boolean');
    assert.equal(typeof callback, 'function');

    var tmpDir = toolSpec.opts.workDir;
    var tmpGemConfigurationFile = path.join(tmpDir, 'gem-' + toolSpec.name + '.conf');
    var originalGemConfigurationFile = path.join(__dirname,'..','ios', 'gemConf', 'gem.conf');

    async.waterfall([
        function (cb) {
            // read configuration to known where mfxcode is installed.
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

            system.spawn('gem', ['uninstall', toolSpec.name, '-v', toolSpec.version, '-n', installBinDir,
                '--config-file', tmpGemConfigurationFile, '-i', installLibDir, removeDependencies ?'--ignore-dependencies': '' ], function(err) {
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
    ], function(err) {
        if (err) {
            console.log("ERROR : ", err);
        }
        callback(err);
    });

}

module.exports = uninstallGem;
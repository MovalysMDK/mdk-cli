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

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var clc = require('cli-color');

var androidPlatform = require('./android');
var iosPlatform = require('./ios');
var html5Platform = require('./html5');
var win8Platform = require('./win8');
var maven = require('./common/maven');

var devToolsSpecs = require('../devtools/specs');
var checkPlatform = require('../devtools/check/common/checkPlatform');
var osName = require('../utils/system/osName');
var projectConfig = require('../project/config');
var systemConfig = require('../config');
var analytics = require('../utils/analytics');

/**
 * Run a command on a platform of the project.
 * @param cmd command to run (add or build).
 * @param platformName platform
 * @param title title of the command to display
 * @param cmdOptions Command options
 * (For example : like '-o' or '--offline' => cmdOptions.offline is true)
 * @param callback callback
 */
function runCmd( cmd, platformName, title, cmdOptions, callback ) {

    assert.equal(typeof platformName, 'string');
    assert.equal(typeof cmdOptions, 'object');
    assert.equal(typeof callback, 'function');

    console.log(title);

    async.waterfall( [
        function(cb) {
            // check platform is compatible with current os.
            checkPlatform(platformName, function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            // read project configuration.
            projectConfig.read( function( err, projectConf ) {
                if ( err) {
                    cb(err);
                }
                else {
                    parseCommandOptions(cmdOptions, projectConf);
                    projectConf.platformName = platformName;
                    cb(null, projectConf);
                }
            });
        },
        function(projectConf, cb) {
            // retrieve devTools specification.
            devToolsSpecs.get(projectConf.project.mdkVersion, false, function(err, devToolsSpec) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, projectConf, devToolsSpec);
                }
            });
        },
        function(projectConf, devToolsSpecs, cb) {
            // Check dev tools are installed for the platform
            systemConfig.get("tools_"+devToolsSpecs.version+"_"+platformName, function(err, toolsInstalled) {
                if (err) {
                    cb(err);
                } else {
                    if (toolsInstalled !== 'true') { // Tools aren't installed
                        cb("You need to install the tools for the "+platformName+" platform first.\r\n"+clc.underline("Use: ")+clc.bold("mdk tools-install " +platformName+ " " + projectConf.project.mdkVersion));
                    } else {
                        cb(null,projectConf, devToolsSpecs);
                    }
                }
            });
        },
        function(projectConf, devToolsSpecs, cb) {
            // retrieve os name
            osName( function(err, name ) {
                if(err) {
                    cb(err);
                }
                else {
                    cb(null, projectConf, devToolsSpecs, name);
                }
            });
        },
        function(projectConf, devToolsSpec, name, cb) {
            // create settings.xml from template.
            maven.createSettingsXml(function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, projectConf, devToolsSpec, name);
                }
            });
        },
        function(projectConf, devToolsSpecs, osName, cb) {

            var platformScript ;

            switch(platformName) {
                case 'android':
                    platformScript = androidPlatform;
                    break;
                case 'ios':
                    platformScript = iosPlatform;
                    break;
				case 'html5':
					platformScript = html5Platform;
                    break;
                case 'win8' :
                    platformScript = win8Platform;
					break;
            }

            if ( platformScript ) {
                platformScript.runCmd(cmd, projectConf, devToolsSpecs, osName, function(err) {
                    if(err) {
                        cb(err);
                    }
                    else {
                        cb(null, projectConf);
                    }
                });
            }
            else {
                cb('Unknown platform: ' + platformName);
            }
        },
        function( projectConf, cb) {
            analytics.mdklog({command:cmd,platform:platformName,version:projectConf.project.mdkVersion}, function(err) {
                cb();
            });
        }
    ], callback);
}


function parseCommandOptions(options, projectConf) {
    if(typeof options.offline != "undefined" && options.offline === true) {
        projectConf.options.mavenOptions.push('-o');
        projectConf.options.cocoapodOptions.push('--no-repo-update');
        projectConf.options.gradleOptions.push('-o');
		projectConf.options.bowerOptions.push('-o');
        projectConf.options.isOffline = true;
    }
}

module.exports = runCmd;
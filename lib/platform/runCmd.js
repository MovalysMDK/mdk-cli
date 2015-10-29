'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var clc = require('cli-color');

var androidPlatform = require('./android');
var iosPlatform = require('./ios');
var maven = require('./common/maven');

var devToolsSpecs = require('../devtools/specs');
var checkPlatform = require('../devtools/check/common/checkPlatform');
var osName = require('../utils/system/osName');
var projectConfig = require('../project/config');
var systemConfig = require('../config');
var LoadingIndicator = require('loading-indicator');

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
    console.log("");
    var spin = new LoadingIndicator({"suffix":"\r"});

    async.waterfall( [
        function (cb) {
            spin.start();
            cb();
        },
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
                        cb("You need to install the tools for the "+platformName+" platform first.\r\n"+clc.underline("Use:")+clc.bold(" mdk tools-install " +platformName+ " " + projectConf.project.mdkVersion));
                    } else {
                        cb(null,projectConf, devToolsSpecs);
                    }
                }
            });
        },
        function(projectConf, devToolsSpecs, cb) {
            // retrieve os name
            osName( function(err, name ) {
                cb(err,projectConf, devToolsSpecs, name);
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
            }

            if ( platformScript ) {
                platformScript.runCmd(cmd, projectConf, devToolsSpecs, osName, cb);
            }
            else {
                cb('Unknown platform: ' + platformName);
            }
        }
    ], function(err) {
        if(!err) {
            //Crash if err...
            spin.stop();
        }
        callback(err);
    });
}


function parseCommandOptions(options, projectConf) {
    if(typeof options.offline != "undefined" && options.offline === true) {
        projectConf.options.mavenOptions.push('-o');
        projectConf.options.cocoapodOptions.push('--no-repo-update');
        projectConf.options.gradleOptions.push('-o');
        projectConf.options.isOffline = true;
    }
}

module.exports = runCmd;
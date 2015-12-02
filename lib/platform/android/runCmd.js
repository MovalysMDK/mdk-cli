'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var clc = require('cli-color');

var maven = require('../common/maven');
var displayMessagesVersion = require('../common/displayMessagesVersion');
var defineEnv = require('./defineEnv');

var gradle = require('./gradle');

/**
 * Run a command on the android project.
 * @param cmd command to run (add or build).
 * @param projectConf project configuration
 * @param toolSpecs specifications of tools
 * @param osName osName
 * @param callback callback
 */
function runCmd( cmd, projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof cmd, 'string');
    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function(cb) {
            displayMessagesVersion(projectConf.project.mdkVersion, cb);
        },
        function(cb) {
            defineEnv(toolSpecs, osName, cb);
        },
        function(cb) {
            // create gradle.properties from template.
            gradle.createGradleProperties(toolSpecs, osName, function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {

            var cmdFunction;
            switch(cmd) {
                case 'add':
                    cmdFunction = require("./add");
                    break;
                case 'build':
                    cmdFunction = require("./build");
                    break;
                case 'displayEnv':
                    cmdFunction = require("./displayEnv");
                    break;
				case 'compile':
					cmdFunction = require('./compile');
					break;
                case 'generate':
                    cmdFunction = require("./../common/generate");
                    break;
                default:
                    cb('Unknown command: ' + cmd);
                    break;
            }

            if ( cmdFunction ) {
                cmdFunction(projectConf, toolSpecs, osName, cb);
            }
            else {
                cb("Undefined function: android." + cmd);
            }
        }

    ], function(err) {
        callback(err);
    });
}

module.exports = runCmd;


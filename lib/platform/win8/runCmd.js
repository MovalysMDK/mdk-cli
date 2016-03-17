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

var displayMessagesVersion = require('../common/displayMessagesVersion');
var defineEnv = require('./defineEnv');

/**
 * Run a command on the project.
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

            var cmdFunction;
            switch(cmd) {
                case 'add':
                    cmdFunction = require("./add");
                    break;
				case 'displayEnv':
                    cmdFunction = require("./displayEnv");
                    break;
                case 'shell':
                    cmdFunction = require("./shell");
                    break;
				case 'generate':
                    cmdFunction = require("./../common/generate");
                    break;
				case 'compile':
					cmdFunction = require('./compile');
					break;
                case 'build':
                    cmdFunction = require("./build");
                    break;
                case 'deploy':
                    cmdFunction = require("./deploy");
                    break;
                default:
                    cb('Unknown command: ' + cmd);
                    break;
            }

            if ( cmdFunction ) {
                cmdFunction(projectConf, toolSpecs, osName, cb);
            }
            else {
                cb("Undefined function: win8." + cmd);
            }
        }

    ], function(err) {
        callback(err);
    });
}

module.exports = runCmd;


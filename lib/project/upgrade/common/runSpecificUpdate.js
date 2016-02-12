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

/**
 * Imports
 */
var child_process = require('child_process');
var clc = require('cli-color');
var async = require('async');
var path = require('path');

var mdkLog = require('../../../utils/log');


/**
 * Runs node upgrade scripts for a specific version. These scripts
 * first have to be installed as npm packages (they require a package.json file)
 * 
 * @param {string}		upgradePath 	Path to the root of upgrade script for a specific version
 * @param {Function}	callback		Callback(err)
 */
function runSpecificUpdate(upgradePath, callback){

	async.waterfall([

		// Run npm install on module
		// @TODO Check if package.json exists, and eventually skip npm install step
		function(cb){
			// Run the process in the tmp root (to get access to node_modules/)
			child_process.exec('npm install', {"cwd": upgradePath}, function(err, stdout, stderr){
				if (err){
					console.log('STDOUT >>>>>>');
					if (stdout){
						console.log( clc.blue.bgWhite(stdout) );
					}
					console.log('\r\nSTDERR >>>>>>');
					if (stderr){
						console.log( clc.red.bgWhite(stderr) );
					}
					return cb("Upgrade script installation exited with code " + err.code);
				}
				
				return cb();
				
			});
		},

		// Running the upgrade script
		// @TODO Implement a stdin stram, to allow input for scripts
		function(cb){
			// Run the process in the tmp root (to get access to node_modules/)
			// but with project root as parameter so it can access files
			var upgrade = child_process.spawn('node', ['.', process.cwd()], {"cwd": upgradePath});
			var hasCalledBack = false; 	// Prevent calling the callback twice
										// Exit event might be fired after error
			
			// Listens for process errors (i.e. can't run)
			upgrade.on('error', function(err){
				mdkLog.ko("An error occured while running upgrade script for version " + path.basename(upgradePath) + " . Check following log.");
				if ( ! hasCalledBack ){
					hasCalledBack = true;
					return cb(err);
				}
			});
			// Listens for exit (whatever the reason). Might be run when process errors
			upgrade.on('exit', function(code, signal){
				if (code !== 0 && ! hasCalledBack){
					hasCalledBack = true;
					return cb("An error occured while running upgrade script for version " + path.basename(upgradePath) + " . Check previous log. Exit Code : " + code);
				}
				if ( ! hasCalledBack ){
					hasCalledBack = true;
					return cb();
				}
			});
			// Listen to stdout stream
			upgrade.stdout.on('data', function(data){
				process.stdout.write( clc.blue.bgWhite(data) );
			});
			// Listen to stderr stream
			upgrade.stderr.on('data', function(data){
				process.stderr.write( clc.red.bgWhite(data) );
			});
		}
		
	], callback);
	
}

module.exports = runSpecificUpdate;
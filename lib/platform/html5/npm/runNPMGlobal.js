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


var spawn = require('child_process').spawn;
var mdkLog = require('../../../utils/log');

/**
 * Runs NPM Global commands (while taking in account current node bugs)
 * Will stream command output to stdout and stderr
 * 
 * @param command Command to run, as string
 * @param args Array of command arguments
 * @param options Object holding several options (cwd, message, errorMessage)
 * @param callback
 */
module.exports = function(command, args, options, cb){
	
	options = options || {	cwd:'.',
							message:"Running " + command + "  " + args.join(" "),
							errorMessage:"Error while running " + command + "  " + args.join(" ")
	};
	
	mdkLog.notice("NPM Exec", options.message);
			
	// Fixes https://github.com/nodejs/node-v0.x-archive/issues/2318
	command = (process.platform === "win32") ? command + ".cmd" : command;

	var proc = spawn(command, args, {cwd: options.cwd});
	proc.stdout.on('data', function(d){
		process.stdout.write(d);
	});
	proc.stderr.on('data', function(d){
		process.stderr.write(d);
	});
	proc.on('error', function(err){
		return cb(err);
	});
	proc.on('close', function(code){
		if (code !== 0){
			return cb(options.errorMessage + " : exited with code " + code);
		}
		return cb();
	});
};
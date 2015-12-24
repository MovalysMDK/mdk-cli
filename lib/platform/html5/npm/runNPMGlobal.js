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
		if (code != 0){
			return cb(options.errorMessage + " : exited with code " + code);
		}
		return cb();
	});
};
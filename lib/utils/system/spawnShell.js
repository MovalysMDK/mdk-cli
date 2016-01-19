"use strict";

var spawn = require('child_process').spawn;
var fs = require('fs');
var clc = require('cli-color');

var mdkLog = require('../log');

module.exports = function(script, callback){
	
	var command = "bash";
	var parameters = ['-i', '-c', script.replace(/(?:\r\n|\r|\n)*?/g, '; ')];

	if ( /^win/.test(process.platform) ){
		command = "cmd.exe";
		script = script
					.replace(/(?:\r?\n\s*\r?\n|\r?\n)/g, ' && ')
					.replace(/(^(\s*&&)*)/g, '')
					.replace(/((\s*&&\s*)*$)/g, '');
		console.log(script);
		parameters = ['/Q', '/F:ON', '/K', script];
	}

	var shell = spawn( command, parameters );
	
	// Redirect streams to "look like" we're in bash or cmd
	// No colors for now on Windows...
	shell.stdout.pipe( process.stdout );
	shell.stderr.pipe( process.stderr );
	process.stdin.pipe( shell.stdin );
	
	shell.on('error', function(err){
		callback("An error occured while running MDK shell : " + err);
	});
	
	shell.on('close', function(code){
		if (code === 0){
			mdkLog.ok("MDK Shell", "Exit");
			return callback();
		}else{
			return callback("MDK Shell exited with error code " + code);
		}
	});
}
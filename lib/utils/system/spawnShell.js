"use strict";

var spawn = require('child_process').spawn;
var fs = require('fs');
var clc = require('cli-color');

var mdkLog = require('../log');

module.exports = function(script, callback){
	
	var command = "bash";
	var parameters = ['-i', '-c', script];
	
	if ( /^win/.test(process.platform) ){
		command = "cmd.exe";
		parameters = ['/Q', '/F:ON', '/K', script];
	}

	var shell = spawn( command, parameters );
	
	// Redirect streams to "look like" we're in bash or cmd
	// No colors for now on Windows...
	shell.stdout.pipe( process.stdout );
	shell.stderr.pipe( process.stderr );
	process.stdin.pipe( shell.stdin );
	
	shell.on('error', function(err){
		console.log("error");
		callback("An error occured while running MDK shell : " + err);
	});
	
	shell.on('close', function(code){
		console.log("exit: " + code);
		if (code === 0){
			mdkLog.ok("MDK Shell", "Exit");
			return callback();
		}else{
			return callback("MDK Shell exited with error code " + code);
		}
	});
}
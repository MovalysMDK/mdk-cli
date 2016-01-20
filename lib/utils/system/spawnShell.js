"use strict";

var spawn = require('child_process').spawn;
var fs = require('fs');
var clc = require('cli-color');

var mdkLog = require('../log');

module.exports = function(script, callback){
    script = script
                .replace(/(?:\r?\n\s*\r?\n|\r?\n)/g, ' && ')
                .replace(/(^(\s*&&)*)/g, '')
                .replace(/((\s*&&\s*)*$)/g, '');
    
    var command = "cmd.exe";
	var parameters = ['/Q', '/F:ON', '/K', script];
    
	if ( /^darwin/.test(process.platform) ){
		script = script
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"');
        var command = "osascript";
        var parameters = ['-e', 'tell application "Terminal" to activate', '-e', 'tell application "Terminal" to do script "' + script + '"' ];
	}

	var shell = spawn( command, parameters );
	
	// Redirect streams to "look like" we're in bash or cmd
	// No colors for now on Windows...
	shell.stdout.on('data', function(d){
        process.stdout.write(d);
    });
	shell.stderr.on('data', function(d){
        process.stderr.write(d);
    });
    process.stdin.on('data', function(d){
        shell.stdin.write(d);
    });
	
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

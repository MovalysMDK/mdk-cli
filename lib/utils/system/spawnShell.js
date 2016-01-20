"use strict";

var spawn = require('child_process').spawn;
var fs = require('fs');
var clc = require('cli-color');

var mdkLog = require('../log');

module.exports = function(script, callback){

	if ( ! /^darwin|^win/.test(process.platform) ){
		return callback("Only Mac and Windows supports MDK Shell. Please use platform-env command");
	}
    
    var command = "cmd.exe";
    var parameters = ['/c', 'start', 'cmd', '/K', script];
    
    if ( /^darwin/.test(process.platform) ){
        command = "osascript";
        parameters = ['-e', 'tell application "Terminal" to activate', '-e', 'tell application "Terminal" to do script "source ' + script + '"' ];
    }

    var shell = spawn( command, parameters, {detached : true} );
    
	// Windows doesn't fire events when command is launched,
	// so we don't need to listen to it
	if ( ! /^win/.test(process.platform) ){
		shell.on('error', function(err){
			callback("An error occured while running MDK shell : " + err);
		});
		
		shell.on('close', function(code){
			if (code === 0){
				mdkLog.ok("MDK Shell", "Successfully spawned");
				return callback();
			}else{
				return callback("MDK Shell exited with error code " + code);
			}
		});
	}else{
		mdkLog.ok("MDK Shell", "Successfully spawned");
		return callback();
	}
}

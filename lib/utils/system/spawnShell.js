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
};
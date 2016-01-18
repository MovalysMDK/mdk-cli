"use strict";

var spawn = require('child_process').spawn;
var fs = require('fs');

var mdkLog = require('../log');

module.exports = function(script, callback){
	
	try{
		fs.unlinkSync('./console_err.log');
	}catch(err){
		mdkLog.warn("Spawn", "console_err.log file could not be removed : " + err );
	}
	
	spawn(	'cmd.exe',
			['/c', 'start', 'cmd', '/F:ON', '/T:03', '/K', script],
			{detached: true, stdio: [ 'ignore', null, null ]} );
	
	// We can't intercept an error without leaving the main process waiting
	// for the child to close.
	return callback();
}
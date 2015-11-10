'use strict';

/**
 * Imports
 */
var fse = require('fs-extra');
var path = require('path');
var async = require('async');

var mdkPath = require('../../mdkPath')();
var mdkLog = require('../../utils/log');

function restore(backupLocation, callback){
	mdkLog.notice('Restore', "Ready For restoration");

	// Running a "." printing loop to notify the user that something is happening
	// as we can't access the progress of the copy function
	var waitingInterval = setInterval(function(){
		process.stdout.write('.');
	}, 200);

	async.waterfall([

		// Empty current dir and undo modifications
		function(cb){
			fse.emptyDir(process.cwd(), function(err){
				if (err){
					return cb(err);
				}
				return cb();
			});
		},

		// restore the backup
		function(cb){

			var copyOptions = {
				clobber: true,
				preserveTimestamps: true,
				filter: /.*/
			};

			fse.copy( backupLocation, process.cwd(), copyOptions, cb);
		}


	], function(err){
		clearInterval( waitingInterval );
		process.stdout.write('\r\n');

		if  (!err){
			mdkLog.ok("Restore", "Restoration done successfully");
		}

		return callback(err);

	});
	
	
}

module.exports = restore;
'use strict';

/**
 * Imports
 */
var fse = require('fs-extra');

var mdkPath = require('../../mdkPath')();
var mdkLog = require('../../utils/log');

/**
 * Remove the backup at the given location
 * 
 * @param {string} 		backupLocation 	The location where the bacup to delete is (folder url)
 * @param {Function} 	callback 		Callback(err)
 */
function remove(backupLocation, callback){

	fse.remove( backupLocation, function(err){
		if (err){
			callback("The backup could not be removed. Check " + mdkPath.tmpDir + ".\n\r" + err.toString().substring(0, 700) + "... And continuing");
		} else {
			mdkLog.notice("Backup", "The backup project has been deleted");
			callback();
		}
	});

	
}

module.exports = remove;
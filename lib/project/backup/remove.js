'use strict';

/**
 * Imports
 */

var fse = require('fs-extra');

var mdkPath = require('../../mdkPath')();
var mdkLog = require('../../utils/log');

function remove(backupLocation, callback){


	fse.remove( backupLocation, function(err){
		if (err){
			callback("The backup could not be removed. Check " + mdkPath.tmpDir + ".\n\r" + err);
		} else {
			mdkLog.notice("Restore", "The backup project has been deleted");
			callback();
		}
	});

	
}

module.exports = remove;
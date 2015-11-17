'use strict';

/**
 * Imports
 */
var fse = require('fs-extra');
var path = require('path');

var mdkLog = require('../../utils/log');
var mdkPath = require('../../mdkPath')();

function backup( callback ){

	// Initialize 
	mdkLog.notice("Backup", "Backing up project. Please Wait ..");

	// Copy parameters
	var currentFormattedDate = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
	var backupLocation = path.join(mdkPath.tmpDir, path.basename( process.cwd() ) + "__BAK_" + currentFormattedDate);
	var copyOptions = {
		clobber: true,
		preserveTimestamps: true
	};

	// Copy folder to .mdk/temp/<CURRENT_PROJECT_FOLDER>__BAK_<YYY-MM-DD_HH-mm-SS>
	fse.copy( './', backupLocation, copyOptions, function(err){

		if (err){
			return callback(err);
		}

		return callback(null, backupLocation);

	});
}

module.exports = backup;
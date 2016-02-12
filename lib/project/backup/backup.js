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
'use strict';

/**
 * Imports
 */
var fse = require('fs-extra');
var path = require('path');

var mdkLog = require('../../utils/log');
var mdkPath = require('../../mdkPath')();

/**
 * Back up the project into the .mdk/tmp folder
 * 
 * @param {Function} callback Callback(err, backupLocation)
 */
function backup( callback ){

	// Initialize 
	mdkLog.notice("Backup", "Backing up project. Please Wait ..");

	// Copy parameters (file name, overwrite)
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
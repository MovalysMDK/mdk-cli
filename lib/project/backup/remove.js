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
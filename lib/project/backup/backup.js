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
var archiver = require('archiver');

var mdkLog = require('../../utils/log');
var mdkPath = require('../../mdkPath')();

/**
 * Back up the project into the .mdk/tmp folder
 * 
 * @param {Function} callback Callback(err, backupLocation)
 */
function backup( callback ){

	// Initialize 
	mdkLog.notice("Backup", "Backing up project. Please Wait ...");
    
	// filename parameters (file name, overwrite)
    var now = new Date();
	var currentFormattedDate =  now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() + "_" + now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds();
	var backupLocation = path.join(mdkPath.tmpDir, path.basename( process.cwd() ) + "__BAK_" + currentFormattedDate + ".zip");
    
	// ZIP project to .mdk/temp/<CURRENT_PROJECT_FOLDER>__BAK_<YYY-MM-DD_HH-mm-SS>.zip
    var output = fse.createWriteStream(backupLocation);
    var backup = archiver.create('zip', {});
    
    output.on('close', function(){
        return callback(null, backupLocation);
    });
    output.on('error', function(err){
        return callback(err);
    });
    
    backup.pipe(output);
   
    backup.directory( process.cwd(), '/' )
            .finalize();
}

module.exports = backup;
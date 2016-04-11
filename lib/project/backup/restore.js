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
var async = require('async');
var path = require('path');
var Decompress = require('decompress');

var mdkPath = require('../../mdkPath')();
var mdkLog = require('../../utils/log');


/**
 * Restores the project from backup at given location
 * Simply empties the project folder and copies back all the backup.
 * 
 * @param {string} 		backupLocation 	Folder location of the project backup
 * @param {Function} 	callback 		Callback(err)
 */
function restore(backupLocation, callback){
	mdkLog.notice('Restore', "Starting restoration. Please wait ...");

	async.waterfall([

		// Checking if backup folder actually exists, before removing everything
		function(cb){
			fse.exists(backupLocation, function(exists){
				if (exists){
					return cb();
				} else {
					return cb( "No backup found at the given location. The project will be left as is. Check " + mdkPath.tmpDir );
				}
			});
		},	

		// Empty current dir = undo modifications
		function(cb){
			
			// fs-extra.emptyDir(&Sync)() don't work properly, so we have to empty the folder by ourselves
			
			// This function is located here so that we don't have to pass the callback to 
			// every recursive call
			function deleteFolderRecursive(p) {
				if( fse.existsSync(p) ) {
					fse.readdirSync(p).forEach(function(file,index){
						var curPath = path.join(p, file);
						if(fse.lstatSync(curPath).isDirectory()) { // recurse
							deleteFolderRecursive(curPath);
						} else { // delete file
							try{
								fse.unlinkSync(curPath);
							}catch(e){
								return cb(e);	
							}
						}
					});
					try{
						fse.rmdirSync(p);
					}catch(e){
						return cb(e);	
					}
				}
			}
			
			// Read every file/folder, and send it to deletion
			var fileNfolder = fse.readdirSync(process.cwd());
			fileNfolder.forEach(function(val, index){
				var file = path.join( process.cwd(), val);
				if(fse.lstatSync( file ).isDirectory()) {
					deleteFolderRecursive( file );
				}else{
					try{
						fse.unlinkSync( file );
					}catch(e){
						return cb(e);
					}
				}
			});
			
			return cb();
		},


		// Wait until folder is completely empty
		// Because there's sometimes a lag on the delete
		// function that causes EPERM errors: folders
		// are being deleted but are not removed yet
		function(cb){
			
			var attempts = 0;
			var MAX_ATTEMPTS = 10;
			var timeout = 500; // ms
			
			async.until(function(){
				
				return fse.readdirSync( process.cwd() ).length === 0 || attempts >= MAX_ATTEMPTS;
			
			}, function(cbWait){
				
				attempts++;
				setTimeout(cbWait, timeout);
				
			}, function(err){
				
				if (attempts >= MAX_ATTEMPTS){
					return cb("Timeout for deleting files has been reached. Please empty your project folder manually and restore from "  + backupLocation);
				}else{
					return cb();
				}
				
			});
			
		},
		
		// restore the backup
		function(cb){
            
            new Decompress()
                .src(backupLocation)
                .dest(process.cwd())
                .use(Decompress.zip())
                .run(function(err){
                    if (err){
                        return cb(err);
                    }
                    return cb();
                });
		}


	], function(err){

		if  (!err){
			mdkLog.ok("Restore", "Restoration done successfully");
		}

		return callback(err);

	});
	
	
}

module.exports = restore;
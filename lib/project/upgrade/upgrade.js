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
var semver = require('semver');
var async = require('async');
var path = require('path');


var check = require('./check');
var getPlatforms = require('../getPlatforms');
var projectBackup = require('../backup');
var android = require('./android');
var ios = require('./ios');
var html5 = require('./html5');
var commonPlatforms = require('./common');
var templates = require('../../mdk/templates');

var mdkLog = require('../../utils/log');
var mdkPath = require('../../mdkPath')();


/**
 * Main upgrade function. In charge of managing the upgrading.
 * 
 * The nested waterfalls and callbacks are here to manage fallbacks in case of
 * error while upgrading, and pose the appropriate response.
 * <ul>
 *   <li>If the update is not possible because of version issues, nothing special to do</li>
 *   <li>If the backup fail, it's deleted</li>
 *   <li>Once the backup is done, any following operation will run into the <i>risky</i> waterfall
 *       which falls back to restoration.</li>
 * </ul>
 * 
 * @param  {string}   target   Target template version to upgrade to
 * @param  {Function} callback Callback(err)
 */
function upgrade(target, callback){

	//		PREPARING UPGRADE
	// Initializing variables

	if ( ! semver.valid(target) ){
		callback("The given version is not valid");
		return;
	}
	var backupLocation = null;
	var templateParent = null;
	var templateRoot = null;
	var templateZip = null;


	//		MAIN WATERFALL, standard fallback

	async.waterfall([

		// Check if upgrade possible
		function(cb){
			check(target, cb);
		},

		// Backup and operate
		function(templateName, currentVersion, templateTarget, mdkTarget, cb){
            
			projectBackup.backup(function(errBackup, bakLoc){

				if (errBackup){
					return cb(errBackup);
				}

				if (bakLoc === null || typeof bakLoc === 'undefined'){
					return cb('The backup location could not be determined for restoring. Please retry, and check your ' + mdkPath.homeDir + ' folder permissions');
				}

				backupLocation = bakLoc;
				mdkLog.ok("Backup", "The project has been backed up at " + backupLocation);

				

				//		"RISKY" WATERFALL, falls back on restoration
				
				mdkLog.notice("Upgrade", "Performing Upgrade operations");
				
				var platforms = [];
				
				async.waterfall([




					// ============= Risky stuff goes here ========
					
					
					// List generated platforms
					function(cbRisky){
						getPlatforms( cbRisky );
					},
					
					// Once platforms are found, apply specific modifications
					// To prevent using synchronous iterator, and running
					// every platform in parallel (we need to force only one
					// fs access at a time to prevent r/w conflicts in case of error)
					// we use one watefall function for each platform, hardcoded.
					function(platformList, cbRisky){
						platforms = platformList;
						if (platforms.length <= 0){
							mdkLog.notice("Platforms", "No platforms found. Use \"mdk platform-add <platform>\" to add new platforms, or check folder name \"android\", \"ios\", ...");
						}
						return cbRisky();
					},
					
					// Platform : Android
					function(cbRisky){
						
						if ( platforms.indexOf("android") != -1 ){
							android.upgrade( templateTarget, mdkTarget, cbRisky );
						} else {
							return cbRisky();
						}
					},
					
					// Platform : iOS
					function(cbRisky){
						if ( platforms.indexOf("ios") != -1 ){
							ios.upgrade( templateTarget, mdkTarget, cbRisky );
						} else {
							return cbRisky();
						}
					},
                    
                    // Platform : HTML5
					function(cbRisky){
						if ( platforms.indexOf("html5") != -1 ){
							html5.upgrade( templateTarget, mdkTarget, cbRisky );
						} else {
							return cbRisky();
						}
					},
					
					// Upgrade mdk-project.json
					function(cbRisky){
                        templates.get( templateName, true, function(err, t){
                            if (err){
                                return cbRisky(err);
                            }
                            commonPlatforms.upgradeProject( templateTarget, mdkTarget, t, cbRisky );
                        });
						
					},
					
					// Download new template ZIP, and extract to temporary
					function(cbRisky){
						mdkLog.notice("Upgrade", "Downloading and running upgrade scripts");
						commonPlatforms.downloadTemplate( templateName, templateTarget, cbRisky );
					},
					
					// Check available upgrades, comparing target to currentVersion
					// @TODO Pass the actual unzipped path to getScripts, not a test value
					function(root, parent, zip, cbRisky){
						
						// Store everything in "global" variables to remove everything in the main
						// waterfall fallback
						templateParent = parent;
						templateRoot = root;
						templateZip = zip;
						
						// FOR TESTING
						// commonPlatforms.getScripts(path.join(mdkPath.tmpDir, "MDK_Basic"), currentVersion, templateTarget, cbRisky);
						commonPlatforms.getScripts(templateRoot, currentVersion, templateTarget, cbRisky);
					},
					
					// Run every scripts needed
					// @TODO Pass the actual unzip path
					function( scripts, cbRisky ){
						if ( scripts.length <= 0 ){
							mdkLog.notice("Upgrade", "No upgrade scripts found to run");
							return cbRisky();
						}
						
						async.eachSeries(scripts, function(script, cbScript){
							console.log('\r\n');
							mdkLog.separator('=', 60);
							mdkLog.separator('=', 60);
							console.log("Upgrading to " + script + "\r\n");
							
							// FOR TESTING
							// commonPlatforms.runSpecificUpdate( path.join(mdkPath.tmpDir, "MDK_Basic", 'upgrades', script), cbScript );
							commonPlatforms.runSpecificUpdate( path.join(templateRoot, 'upgrades', script), cbScript );
							
						}, function(err){
							console.log('\r\n');
							mdkLog.separator('=', 60);
							mdkLog.separator('=', 60);
							if (err){
								return cbRisky(err);
							}
							return cbRisky();
						});
						
					},
					
					// Once scripts ran, clean template stuff
					function( cbRisky ){
						commonPlatforms.cleanTemplate( templateParent, templateZip, cbRisky);
					}

					// =============== END RISKY =====================





				//		"RISKY" OPERATIONS FALLBACK, performs restoration
				], function(errRisky){

					if ( ! errRisky ){ 
						return cb();
					}
					
					// Process restoration if there is an error during upgrade
					mdkLog.ko("Upgrade", "An error occurred (will be attempting restoration) : "  + errRisky);
					
					//		CLEANING TMP (if there are some)
					commonPlatforms.cleanTemplate( templateParent, templateZip, function(){
						
						//		RESTORATION
						
						// Restoring from backup
						if (backupLocation === null || typeof backupLocation === 'undefined'){
							return callback('The backup could not be found. The project will be left as is. Check for backup at ' + mdkPath.tmpDir);
						}
						projectBackup.restore(backupLocation, function(errRestore){
							if (errRestore) {
								// Skip the main waterfall fallback which removes the backup
								return callback("An error occurred during restoration:\r\n" +
													errRestore.toString().substring(0,700) + "\r\n(first 700 char) .\n\rThe backup have not been deleted, at " + mdkPath.tmpDir);
							} else {
								// Call the waterfall callback to remove backup folder
								return cb("The project has been restored successfully after an error (see previous log)");
							}
						});
						
					});
						

				
				});
			});
		}

	], function(err){ // Main waterfall fallback, performs backup remove


		//		REMOVE BACKUP

		if (backupLocation !== null){
			// Remove the remaining backup, once it has been restored 
			// and if no errors happened during restoration
			projectBackup.remove( backupLocation, function(errRemove){
				if (errRemove){
					err = err + "\r\nThe backup might not be removed : " + errRemove;
				}
				return callback(err);
			});
		} else {
			return callback(err);
		}

	}); 

}




module.exports = upgrade;
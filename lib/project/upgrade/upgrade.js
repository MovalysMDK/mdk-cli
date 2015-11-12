'use strict';

/**
 * Imports
 */
var semver = require('semver');
var async = require('async');


var check = require('./check');
var getPlatforms = require('./getPlatforms');
var projectBackup = require('../backup');
var android = require('./android');
var ios = require('./ios');

var mdkLog = require('../../utils/log');
var mdkPath = require('../../mdkPath')();


/**
 * Main upgrade function. In charge of managing the upgrading
 * @param  {string}   target   Target version to upgrade to
 * @param  {Function} callback Callback(err)
 */
function upgrade(target, callback){

	//		PREPARING UPGRADE

	if ( ! semver.valid(target) ){
		callback("The given version is not valid");
		return;
	}
	var backupLocation = null;



	//		MAIN WATERFALL, standard fallback

	async.waterfall([

		// Check if upgrade possible
		function(cb){
			check(target, cb);
		},

		// Backup and operate
		function(cb){
			projectBackup.backup(function(errBackup, bakLoc){

				if (errBackup){
					return cb(errBackup);
				}

				if (bakLoc === null || typeof bakLoc === 'undefined'){
					return cb('The backup location could not be determined for restoring. Please retry, and check your ' + mdkPath.homeDir + ' folder permissions');
				}

				backupLocation = bakLoc;

				mdkLog.ok("Backup", "The project has been backed up at " + backupLocation);


				mdkLog.notice("Upgrade", "Performing Upgrade operations");


				//		"RISKY" WATERFALL, falls back on restoration

				async.waterfall([


					// ============= Risky stuff goes here ========
					
					// Upgrade mdk-project.json
					function(cbRisky){
						// @TODO Upgrade mdk-project.json
						cbRisky();
					},
					
					// List generated platforms
					function(cbRisky){
						getPlatforms( cbRisky );
					},
					
					// Once platforms are found, apply specific modifications
					function(platformList, cbRisky){
						
						if (platformList.length <= 0){
							return cbRisky("No platforms found. Use \"mdk platform-add <platform>\" to add new platforms, or check folder name \"android\", \"ios\", ...");
						}
						
						// Perform specific upgrade operation on each platforms
						async.each(platformList, function(platform, cbPlatform){
							
							if ( platform == "android" ){
								platform = android;
							} else if ( platform == "ios" ){
								platform = ios;
							}
							
							platform.upgrade( target, cbPlatform );
							
						},
						function(err){
							if (err){
								return cbRisky(err);
							}
							mdkLog.ok("Upgrade", "All platforms successfully updated");
							return cbRisky();
						});
						
					}

					// ===============================================


				//		"RISKY" OPERATIONS FALLBACK, performs restoration

				], function(errRisky){

					if (errRisky){ // Process restoration if there is an error during upgrade

						mdkLog.ko("Upgrade", "An error occurred (will be attempting restoration) : "  + errRisky);



						//		RESTORATION

						// Restoring from backup
						if (backupLocation === null || typeof backupLocation === 'undefined'){
							return callback('The backup could not be found. The project will be left as is. Check for backup at ' + mdkPath.tmpDir);
						}
						projectBackup.restore(backupLocation, function(errRestore){
							if (errRestore) {
								// Skip the main waterfall fallback which removes the backup
								return callback("An error occurred during restoration:\r\n" +
													errRestore + ".\n\rThe backup have not been deleted, at " + mdkPath.tmpDir);
							} else {
								// Call the waterfall callback to remove backup folder
								return cb("The project has been restored successfully after an error (see previous log)");
							}
						});


					} else {
						return cb();
					}
				
				}); // Risky waterfall fallback
			}); // projectBackup.backup
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
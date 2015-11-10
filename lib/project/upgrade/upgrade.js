'use strict';

/**
 * Imports
 */
var semver = require('semver');
var async = require('async');


var check = require('./check');
var projectBackup = require('../backup');

var mdkLog = require('../../utils/log');


/**
 * Main upgrade function. In charge of managing the upgrading
 * @param  {string}   target   Target version to upgrade to
 * @param  {Function} callback Callback(err)
 */
function upgrade(target, callback){

	if ( ! semver.valid(target) ){
		callback("The given version is not valid");
		return;
	}

	var backupLocation = null;
	
	async.waterfall([

		// Check if upgrade is possible
		function(cb){
			check(target, cb);
		}, 

		// Create a Backup for the project, just in case...
		projectBackup.backup,

		// Upgrade files
		function(bakLoc, cb){
			if (bakLoc === null || typeof bakLoc === 'undefined'){
				return cb('The backup location could not be determined. Please retry, and check your ~/.mdk folder persmissions');
			}
			backupLocation = bakLoc;
			projectBackup.restore(backupLocation, cb);
		}

	], callback);
	
}


module.exports = upgrade;
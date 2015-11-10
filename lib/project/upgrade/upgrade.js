'use strict';

/**
 * Imports
 */
var semver = require('semver');
var async = require('async');


var check = require('./check');
var backup = require('../backup');

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
	
	async.waterfall([

		// Check if upgrade is possible
		function(cb){
			check(target, cb);
		}, 

		// Create a Backup for the project, just in case...
		backup.backupCurrentProjet,

		// Upgrade files
		function(backupLocation, cb){
			backup.restoreCurrentProjectFrom(backupLocation, cb);
		}

	], callback);
	
}


module.exports = upgrade;
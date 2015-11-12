"use strict";

/**
 * Imports
 */
var async = require('async');

var upgradePOM = require('./upgradePOM');
var upgradeGradle = require('./upgradeGradle');

var mdkLog = require("../../../utils/log");

function upgrade(target, callback){
	mdkLog.notice("Upgrading Android");
	
	async.parallel([
		
		// Update POM.xml
		function(cb){
			upgradePOM(target, cb);
		},
		
		function(cb){
			upgradeGradle(target, cb);
		}
		
	], function(err, results){
		mdkLog.ok("Android project configuration successfully upgraded");
		return callback(err);
	});
	
	
	
}

module.exports = upgrade;
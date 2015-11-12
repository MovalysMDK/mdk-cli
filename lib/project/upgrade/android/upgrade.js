"use strict";

/**
 * Imports
 */
var async = require('async');

var upgradePOM = require('./upgradePOM');
var upgradeGradle = require('./upgradeGradle');

var mdkLog = require("../../../utils/log");

function upgrade(templateTarget, mdkTarget, callback){
	mdkLog.notice("Upgrading Android");
	
	async.parallel([
		
		// Update POM.xml
		function(cb){
			upgradePOM(mdkTarget, cb);
		},
		
		function(cb){
			upgradeGradle(mdkTarget, cb);
		}
		
	], function(err, results){
		mdkLog.ok("Android project configuration successfully upgraded");
		return callback(err);
	});
	
	
	
}

module.exports = upgrade;
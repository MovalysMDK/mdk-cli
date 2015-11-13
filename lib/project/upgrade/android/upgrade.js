"use strict";

/**
 * Imports
 */
var async = require('async');

var upgradePOM = require('../common/upgradePOM');
var upgradeGradle = require('./upgradeGradle');

var mdkLog = require("../../../utils/log");

function upgrade(templateTarget, mdkTarget, callback){
	
	async.parallel([
		
		// Update POM.xml
		function(cb){
			upgradePOM(mdkTarget, "android", cb);
		},
		
		// Update build.gradle
		function(cb){
			upgradeGradle(mdkTarget, cb);
		}
		
	], function(err, results){
		if (err){
			return callback(err);
		}
		mdkLog.ok("Upgrade", "Android project configuration successfully upgraded");
		return callback();
	});
	
	
	
}

module.exports = upgrade;
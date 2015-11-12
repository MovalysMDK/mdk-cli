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
			return upgradePOM(target, cb);
		},
		
		function(cb){
			return upgradeGradle(target, cb);
		}
		
	], function(err, results){
		callback(err);
	});
	
	
	
}

module.exports = upgrade;
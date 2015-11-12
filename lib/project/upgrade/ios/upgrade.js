"use strict";

/**
 * Imports
 */
var async = require('async');

var mdkLog = require("../../../utils/log");
var upgradePOM = require('../common/upgradePOM');


function upgrade(templateTarget, mdkTarget, callback){
	
	async.waterfall([
		
		
		// Update POM.xml
		function(cb){
			upgradePOM(mdkTarget, "ios", cb);
		}
		
	], function(err){
		if (err){
			return callback(err);
		}
		
		mdkLog.ok("Upgrade", "iOS project configuration successfully upgraded");
		return callback();
	});
	
}

module.exports = upgrade;
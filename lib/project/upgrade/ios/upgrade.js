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
"use strict";

/**
 * Imports
 */
var async = require('async');

var mdkLog = require("../../../utils/log");
var upgradePOM = require('../common/upgradePOM');
var upgradePodfile = require('./upgradePodfile');

/**
 * Managing the upgrade operations for iOS platform
 * 
 * @param {string} 		templateTarget 	Target template version
 * @param {string} 		mdkTarget 		MDK version associated wit the target template version
 * @param {Function}	callback		Callback(err)
 */
function upgrade(templateTarget, mdkTarget, callback){
	
	async.waterfall([
		
		
		// Update POM.xml
		function(cb){
			upgradePOM(mdkTarget, "ios", cb);
		},
		
		// Upgrade Podfile
		function(cb){
			upgradePodfile(mdkTarget, cb);
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
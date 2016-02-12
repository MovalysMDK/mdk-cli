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
var fse = require('fs-extra');
var async = require('async');
var path = require('path');


/**
 * Upgrades the build.gradle file with the new mdkAndroidVersion
 * 
 * @param {string}		mdkTarget 	MDK version associated with the target template version
 * @param {Function}	callback	Callback(err)
 */
function upgradeGradle(mdkTarget, callback){
	
	var gradleURL = path.join(process.cwd(), "android", "build.gradle");
	
	async.waterfall([
		
		// Check if build.gradle exists
		function(cb){
			fse.access(gradleURL, fse.R_OK | fse.W_OK, function(err){
				if ( err ){
					return cb("The build.gradle file could not be found of is not accessible for platform Android");
				}else{
					return cb();
				}
			});
		},
		
		// Open build.gradle file
		function(cb){
			fse.readFile( gradleURL, cb );
		},
		
		// Parse buffer to string and check if property exists in the file
		function(data, cb){
			var gradle = data.toString();
			
			if ( gradle.indexOf("mdkAndroidVersion") == -1 ){
				return cb("The MDK Version property could not be found in the gradle.build file. Please check your gradle configuration");
			}
			return cb(null, gradle);
		},
		
		// Edit MDK Version
		function(gradle, cb){
			gradle = gradle.replace(/(.*?mdkAndroidVersion *?= *?")([^"]*)(".*)/mi, "$1" + mdkTarget + "$3");
			return cb(null, gradle);
		},
		
		// Save changes
		function(gradle, cb){
			fse.writeFile( gradleURL, gradle, cb );
		}
		
	], function(err){
		return callback(err);
	});
	
}

module.exports = upgradeGradle;
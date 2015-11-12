"use strict";

/**
 * Imports
 */
var fse = require('fs-extra');
var async = require('async');
var path = require('path');



function upgradeGradle(target, callback){
	
	var gradleURL = path.join(process.cwd(), "android", "build.gradle");
	
	async.waterfall([
		
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
			gradle = gradle.replace(/(.*?mdkAndroidVersion *?= *?")([^"]*)(".*)/mi, "$1" + target + "$3");
			return cb(null, gradle);
		},
		
		// Save changes
		function(gradle, cb){
			fse.writeFile( gradleURL, gradle, cb);
		}
		
	], function(err){
		callback(err);
	});
	
}

module.exports = upgradeGradle;
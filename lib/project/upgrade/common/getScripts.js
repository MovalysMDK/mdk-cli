"use strict";


/**
 * Imports
 */
var async = require('async');
var fs = require('fs');
var path = require('path');
var semver = require('semver');



function getScripts(templatePath, currentVersion, targetVersion, callback){
	
	var scriptList = [];

	// Check if upgrades folder exists
	fs.stat( path.join(templatePath, "upgrades"), function(err, stat){
		
		if ( err || ! stat.isDirectory() ){
			return callback(null, []);
		}
		
		async.waterfall([
			
			// Get all upgrade folders
			function(cb){
				fs.readdir( path.join(templatePath, "upgrades"), function(err, files){
					if (err){
						return cb(err);
					}
					return cb(null, files);
				});
			},
			
			// Filter to keep only the correct version numbers
			function( files, cb ){
				files = files.filter(function(f, i, a){
					return semver.valid(f) != null;
				});
				return cb( null, files );
			},
			
			// Select only version between current and target version
			function( scripts, cb ){
				scriptList = scripts.filter(function(f, i, a){
					return semver.satisfies( f, ">" + currentVersion + " " + "<=" + targetVersion);
				});
				
				// Order list, to execute scripts in order
				scriptList = scriptList.sort(function(a, b){
					if ( semver.lt( a, b ) ){
						return -1;
					}else if ( semver.gt(a, b) ){
						return 1;
					} else {
						return 0;
					}
				});
				
				return cb( null );
			}
			
			
		], function(err){
			if (err){
				return callback(err);
			}
			return callback( null, scriptList );
		});
		
			
	});
	
}

module.exports = getScripts;
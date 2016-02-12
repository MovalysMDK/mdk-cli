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
var fs = require('fs');
var path = require('path');
var semver = require('semver');


/**
 * Retreives every upgrade scripts to run based on current and target versions.
 * Can return an empty array in callback: this means there are no sripts to run
 * to upgrade between current and target.
 * 
 * @param {string} 		templatePath	Root template folder (the one holding common/, android/, and upgrades/)
 * @param {string} 		currentVersion 	Current template version
 * @param {string} 		targetVersion 	Target template version
 * @param {Function} 	callback		Callback(err, scripts list as Array[{string}])
 */
function getScripts(templatePath, currentVersion, targetVersion, callback){
	
	var scriptList = [];

	// Check if upgrades folder exists
	fs.stat( path.join(templatePath, "upgrades"), function(err, stat){
		
		// If it doesn't exist, we throw no error. Maybe no scripts are necessary to upgrade.
		if ( err || ! stat.isDirectory() ){
			return callback(null, []);
		}
		
		async.waterfall([
			
			// Get all versions upgrade folders
			function(cb){
				fs.readdir( path.join(templatePath, "upgrades"), function(err, files){
					if (err){
						return cb(err);
					}
					return cb(null, files);
				});
			},
			
			// Filter to keep only the valid version numbers
			// Maybe this folder will hold other folders...
			function( files, cb ){
				files = files.filter(function(f){
					return semver.valid(f) !== null;
				});
				return cb( null, files );
			},
			
			// Filter and order
			function( scripts, cb ){
				
				// Filter versions to keep only the ones between current and target version
				scriptList = scripts.filter(function(f){
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
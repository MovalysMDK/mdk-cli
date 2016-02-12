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
var path = require("path");

var mdkVersion = require('../../../mdk/versions');

/**
 * Upgrades the Podfile with the MFlibs and MDKControl versions
 * 
 * @param {string}		mdkTarget 	MDK version associated with the target template version
 * @param {Function}	callback	Callback(err)
 */
function upgradePodfile(mdkTarget, callback){
	
	var podfileURL = path.join( process.cwd(), 'ios', 'Podfile');
	var mfVersion = null;
	var mdkControl = null;
	
	async.waterfall([
		
		// Check if Podfile exists
		function(cb){
			fse.access(podfileURL, fse.R_OK | fse.W_OK, function(err){
				if ( err ){
					return cb("The Podfile file could not be found of is not accessible for platform iOS");
				}else{
					return cb();
				}
			});
		},
		
		// Get iOS MDK framework version from mdkversions.json
		function(cb){
			mdkVersion.get( mdkTarget, false, cb );
		},
		
		// Check and store framework versions
		function( version, cb ){
			if ( ! ("ios" in version && "mdkControl" in version.ios && "mfVersion" in version.ios) ){
				return cb("Your cache version is not up to date. Please use \"mdk cache-clear\".");
			}
			
			mfVersion = version.ios.mfVersion;
			mdkControl = version.ios.mdkControl;
			return cb();
		},
		
		// Open Podfile
		function(cb){
			fse.readFile( podfileURL, cb );
		},
		
		// Parse buffer to string and check if property exists in the file
		function(data, cb){
			var pod = data.toString();
			
			if ( pod.match(/pod ['"]MFCore['"], '([^'"]*?)'/mi) === null ){
				return cb("Your Podfile could not be updated, because no MFCore version is defined in it. Please check your Podfile and restart.");
			}
			if ( pod.match(/pod ['"]MFUI['"], '([^'"]*?)'/mi) === null ){
				return cb("Your Podfile could not be updated, because no MFUI version is defined in it. Please check your Podfile and restart.");
			}
			if ( pod.match(/pod ['"]MDKControl['"], '([^'"]*?)'/mi) === null ){
				return cb("Your Podfile could not be updated, because no MDKControl version is defined in it. Please check your Podfile and restart.");
			}
			
			return cb(null, pod);
		},
		
		// Edit MDK Version
		function(pod, cb){
			
			pod = pod
					.replace(/(pod ['"]MFCore['"], ')([^'"]*?)(')/mi, "$1" + mfVersion + "$3")
					.replace(/(pod ['"]MFUI['"], ')([^'"]*?)(')/mi, "$1" + mfVersion + "$3")
					.replace(/(pod ['"]MDKControl['"], ')([^'"]*?)(')/mi, "$1" + mdkControl + "$3");
					
			return cb(null, pod);
		},
		
		// Save changes
		function(pod, cb){
			fse.writeFile( podfileURL, pod, cb );
		}
		
		
	], function(err){
		if (err){
			return callback(err);
		}
		
		return callback();
	});
	
}


module.exports = upgradePodfile;
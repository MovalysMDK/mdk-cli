"use strict";


/**
 * Imports
 */
var fse = require('fs-extra');
var async = require('async');
var path = require("path");

var mdkLog = require('../../../utils/log');
var mdkVersion = require('../../../mdk/versions');


function upgradePodfile(mdkTarget, callback){
	
	var podfileURL = path.join( process.cwd(), 'ios', 'Podfile');
	var mfVersion = null;
	var mdkControl = null;
	
	async.waterfall([
		
		// Check if Podfile exists
		function(cb){
			fse.exists(podfileURL, function(exists){
				if ( ! exists ){
					return cb("The Podfile file could not be found for platform iOS");
				}else{
					return cb();
				}
			})
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
			fse.readFile( podfileURL, function(err, data){
				if (err){
					return cb(err);
				}
				return cb( null, data );
			});
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
			fse.writeFile( podfileURL, pod, cb);
		}
		
		
	], function(err){
		if (err){
			return callback(err);
		}
		
		return callback();
	});
	
}


module.exports = upgradePodfile;
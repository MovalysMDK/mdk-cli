'use strict';


/**
 * Imports
 */
var semver = require('semver');
var async = require('async');

var projectInfos = require('../infos');
var templates = require('../../mdk/templates');
var mdkLog = require('../../utils/log');


/**
 * Checks if upgrade is possible:
 * <ul>
 *   <li>Version passed is valid</li>
 *   <li>Version passed is newer than current</li>
 *   <li>Version passed exists for the current template</li>
 * </ul>
 * @param {string} 		Target 		template version to upgrade to
 * @param {Function} 	callback 	Callback(err, templateName, currentVersion, templateTarget, mdkTarget)
 */
function check(target, callback){
	
	// Retreive project information
	projectInfos(function(err, data){
		
		
		if (err){
			return callback(err);
		}
			
		var currentVersion = data.template.version;
		
		if ( ! semver.gt( target, currentVersion ) ){
			callback("The target version is older than the current template version");
			return;
		}

		// Get templates list to check if version is available
		templates.get( data.template.name, true, function(err, t){
			
			var mdkTarget = null;
			var templateTarget = null;

			// Going through every version for the given template
			async.each( t.versions, function(v, cbVersions){
				
				// If we find the corresponding version
				if ( semver.eq(v.version, target) ){
					
					templateTarget = target;
					if ( ! ("mdkVersion" in v) ){
						mdkTarget = templateTarget;
					}else{
						mdkTarget = v.mdkVersion;
					}
					// Return with true is checked in the async.each fallback
					cbVersions(true);
					
				}else{
					cbVersions();
				}
				
				
			// This callback is also used for positive response
			}, function(found){ 
				if (found === true){ // We found a version and break using the callback system
				
					mdkLog.notice("Templates", "Found the given template version");
					callback(null, data.template.name, currentVersion, templateTarget, mdkTarget);
					
				}else if (found !== null){ // The error is not a "found" signal, so it's an error
				
					callback(found);
					
				}else{ // We found no matching version, but no error occured
				
					callback("The given target does not exist for the relevant template.");
				}
			});
		});

		
	});
}

module.exports = check;
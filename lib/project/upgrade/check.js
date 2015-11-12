'use strict';


/**
 * Imports
 */
var semver = require('semver');
var async = require('async');

var projectInfos = require('../infos');
var templates = require('../../mdk/templates');
var mdkLog = require('../../utils/log');

function check(target, callback){
	projectInfos(function(err, data){
		if (err){
			callback(err);
		} else {

			if ( ! semver.gt( target, data.template.version ) ){
				callback("The target version is older than the current template version");
				return;
			}

			templates.get( data.template.name, true, function(err, t){
				
				var mdkTarget = null;
				var templateTarget = null;

				// Going through every version for the given template
				async.each( t.versions, function(v, cbVersions){
					
					if ( semver.eq(v.version, target) ){
						
						templateTarget = target;
						if ( ! ("mdkVersion" in v) ){
							mdkTarget = templateTarget;
						}else{
							mdkTarget = v.mdkVersion;
						}
						cbVersions(true);
						
					}else{
						cbVersions();
					}
					
				}, function(found){ // This callback is ALSO USED FOR POSITIVE RESPONSE
					if (found === true){
						// We found a version and break using the callback system
						mdkLog.notice("Templates", "Found the given template version");
						callback(null, templateTarget, mdkTarget);
					}else if (found !== null){
						// The error is not a "found" signal, so it's an error
						callback(found);
					}else{
						// We found no matching version, but no error occured
						callback("The given target does not exist for the relevant template.");
					}
				});
			});

		}
	});
}

module.exports = check;
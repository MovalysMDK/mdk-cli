'use strict';

/**
 * Imports
 */
var semver = require('semver');
var async = require('async');

var projectInfos = require('../infos');
var projectBackup = require('./backup');
var templates = require('../../mdk/templates');
var mdkLog = require('../../utils/log');


/**
 * Main upgrade function. In charge of managing the upgrading
 * @param  {string}   target   Target version to upgrade to
 * @param  {Function} callback Callback(err)
 */
function upgrade(target, callback){

	if ( ! semver.valid(target) ){
		callback("The given version is not valid");
		return;
	}
	
	async.waterfall([

		// Check if upgrade is possible
		function(cb){
			projectInfos(function(err, data){
				if (err){
					cb(err);
				} else {

					if ( ! semver.gt( target, data.template.version ) ){
						cb("The target version is older than the current template version");
						return;
					}

					templates.get( data.template.name, true, function(err, t){

						// Going through every version for the given template
						async.each( t.versions, function(v, cbVersions){
							if ( semver.eq(v.version, target) ){
								cbVersions(true);
							}else{
								cbVersions();
							}
						}, function(found){ // This callback is ALSO USED FOR POSITIVE RESPONSE
							if (found === true){
								// We found a version and break using the callback system
								mdkLog.notice("Templates", "Found the given template version");
								cb();
							}else if (found != null){
								// The error is not a "found" signal, so it's an error
								cb(found);
							}else{
								// We found no matching version, but no error occured
								cb("The given target does not exist for the relevant template.");
							}
						});
					});

				}
			});
		}

	], function(err){ // Main waterfall fallback
		callback(err);
	});
	

}


module.exports = upgrade;
"use strict";

/**
 * Imports
 */
var fse = require('fs-extra');
var path = require('path');
var async = require('async');

var mdkLog = require('../../../utils/log');

/**
 * Upgrades the mdk-project.json with the new MDK and template version
 * 
 * @param {string}		templateTarget	Target template version
 * @param {string}		mdkTarget 		MDK version associated with the target template version
 * @param {Function}	callback		Callback(err)
 */
function upgradeProject( templateTarget, mdkTarget, callback ){
	
	var mdkProjectURL = path.join( process.cwd(), 'mdk-project.json' );
	
	async.waterfall([
		
		// Check if mdk-project.json exists
		function(cb){
			
			fse.access( mdkProjectURL, fse.R_OK | fse.W_OK, function(err){
				if ( err ){
					return cb("The mdk-project.json file could not be found or is not accessible");
				}else{
					return cb();
				}
			});
		},
		
		// Open and parse mdk-project.json
		function(cb){
			fse.readJSON( mdkProjectURL, cb );
		},
		
		// Edit data
		function(json, cb){
			if ( ! ("project" in json) ){
				return cb("The ./mdk-project.json is not well formatted. Missing \"project\" property in root");
			}
			if ( ! ("template" in json) ){
				return cb("The ./mdk-project.json is not well formatted. Missing \"template\" property in root");
			}
			if ( ! ("version" in json.project) ){
				return cb("The ./mdk-project.json is not well formatted. Missing \"version\" property in project");
			}
			if ( ! ("version" in json.template) ){
				return cb("The ./mdk-project.json is not well formatted. Missing \"version\" property in template");
			}
			
			json.template.version = templateTarget;
			json.project.mdkVersion = mdkTarget;
			
			return cb(null, json);
		},
		
		// Save file
		function(json, cb){
			fse.writeJSON( path.join(process.cwd(), "mdk-project.json"), json, cb);
		}
		
	], function(err){
		if (err){
			return callback(err);
		}
		mdkLog.ok("Upgrade", "MDK project configuration successfully upgraded");
		return callback();
	});
	
}

module.exports = upgradeProject;
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
var path = require('path');
var async = require('async');
var semver = require('semver');

var mdkLog = require('../../../utils/log');

/**
 * Upgrades the mdk-project.json with the new MDK and template version
 * 
 * @param {string}		templateTarget	Target template version
 * @param {string}		mdkTarget 		MDK version associated with the target template version
 * @param {Function}	callback		Callback(err)
 */
function upgradeProject( templateTarget, mdkTarget, templateObject, callback ){
	
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
        
        // Reinitiating available platforms on mdk-project.json
        function(json, cb){
            json.template.platforms = [];
            templateObject.platforms.forEach(function(v, i){
                if ( semver.lte(v.minTemplateVersion, templateTarget) ){
                    json.template.platforms.push(v);
                }
            });
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
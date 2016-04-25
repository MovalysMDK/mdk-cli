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
var path = require('path');

var mdkVersions = require('../../../mdk/versions');

/**
 * Upgrades the webapp/bower.json file with the new mdkHTML5Version
 * 
 * @param {string}		mdkTarget 	MDK version associated with the target template version
 * @param {Function}	callback	Callback(err)
 */
function upgradeBower(mdkTarget, callback){
	
	var bowerURL = path.join(process.cwd(), "html5", "webapp", "bower.json");
	
	async.waterfall([
		
		// Check if webapp/bower.json exists
		function(cb){
			fse.access(bowerURL, fse.R_OK | fse.W_OK, function(err){
				if ( err ){
					return cb("The webapp/bower.json file could not be found of is not accessible for platform HTML5");
				}else{
					return cb();
				}
			});
		},
        
		// Open webapp/bower.json file
		function(cb){
			fse.readJson( bowerURL, cb );
		},
		
		// Parse buffer to string and check if property exists in the file
		function(data, cb){
			var bower = data;
			
			if ( ! data.hasOwnProperty("dependencies") || ! data.dependencies.hasOwnProperty("mdk-html5-lib-core") || ! data.dependencies.hasOwnProperty("mdk-html5-lib-ui") ){
				return cb("The MDK framework Version property could not be found in the webapp/bower.json file. Please check your bower configuration");
			}
			return cb(null, bower);
		},
		
		// Edit MDK Version
		function(bower, cb){
            
            mdkVersions.get( mdkTarget, false, function(err, v){
                if (err){
                    return cb(err);
                }
                
               bower.dependencies['mdk-html5-lib-core'] = v.html5.mdkHtml5LibCoreVersion;
               bower.dependencies['mdk-html5-lib-ui'] = v.html5.mdkHtml5LibUIVersion;
               
                return cb(null, bower);
            });
          
		},
		
		// Save changes
		function(bower, cb){
			fse.writeJson( bowerURL, bower, cb );
		}
		
	], function(err){
		return callback(err);
	});
	
}

module.exports = upgradeBower;
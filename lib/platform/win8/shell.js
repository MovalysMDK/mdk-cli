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


var mustache = require('mustache');
var path = require('path');
var fs = require('fs');
var async = require('async');
var iconv = require('iconv-lite');

var spawnShell = require('../../utils/system/spawnShell');
var runCmd = require('./runCmd');

var jdk = require('../common/jdk');
var maven = require('../common/maven');
var gems = require('../ios/gems');
var doxygen = require('../ios/doxygen');
var uncrustify = require('../ios/uncrustify');
var xctool = require('../ios/xctool');
var gradle = require('../android/gradle');
var sdk = require('../android/sdk');



module.exports = function( projectConf, devToolsSpecs, osName, callback ){
	
	var pathvar = [];
	var env = [];
	
	async.waterfall([
		
		// Grabbing every env instrcutions
		function(cb){
			jdk.getEnv(devToolsSpecs, osName, "win8", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
		function(cb){
			maven.getEnv(devToolsSpecs, osName, "win8", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
		
		// Building the script
		function(cb){
			var objects = {
				version: projectConf.project.mdkVersion,
				platform: "win8",
				env: env.filter(function(e){return typeof e == "string";}),
				pathvar: pathvar.filter(function(e){return typeof e == "string";})
            };
            objects.scriptLoc = ( /^win/.test(osName) ? path.join(require('../../mdkpath')().tmpDir, "mdkenv.bat") : path.join(require('../../mdkpath')().tmpDir, "mdkenv.sh") );
            if ( /^win/.test(osName)){
                objects.win = true;
            }else{
                objects.bash = true;
            }
            			
			var script = mustache.render( fs.readFileSync(path.join(__dirname, "..", "common", 'mdk.env')).toString(), objects);
			
            // If Windows, convert to CP437 (DOS) encoding
            if (/^win/.test(osName)){
                script = iconv.encode(script, '437');
            }
            
            fs.writeFileSync(objects.scriptLoc, script, {mode:493}); // = 0o755
            
			return cb(null, objects.scriptLoc);
		}
		
	], function(err, script){
		if (err){
			return callback(err);
		}
		spawnShell(script,  callback);
		
	});

};
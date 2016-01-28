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
			jdk.getEnv(devToolsSpecs, osName, "html5", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
		function(cb){
			maven.getEnv(devToolsSpecs, osName, "html5", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
        function(cb){
			sdk.getEnv(devToolsSpecs, osName, "html5", function(err, addEnv, addPathvar){
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
				platform: "html5",
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
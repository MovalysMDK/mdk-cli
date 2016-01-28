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
var gems = require('./gems');
var doxygen = require('./doxygen');
var uncrustify = require('./uncrustify');
var xctool = require('./xctool');



module.exports = function( projectConf, devToolsSpecs, osName, callback ){
	
	var pathvar = [];
	var env = [];
	
	async.waterfall([
		
		// Grabbing every env instrcutions
		function(cb){
			jdk.getEnv(devToolsSpecs, osName, "ios", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
		function(cb){
			maven.getEnv(devToolsSpecs, osName, "ios", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
		function(cb){
			gems.getEnv(devToolsSpecs, osName, "ios", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
        function(cb){
			doxygen.getEnv(devToolsSpecs, osName, "ios", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
        function(cb){
			uncrustify.getEnv(devToolsSpecs, osName, "ios", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
        function(cb){
			xctool.getEnv(devToolsSpecs, osName, "ios", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
        function(cb){
            env = env.concat(['export LANG=en_US.UTF-8']);
            cb();
        },
		
		// Building the script
		function(cb){
			var objects = {
				version: projectConf.project.mdkVersion,
				platform: "ios",
				env: env.filter(function(e){return typeof e == "string";}),
				pathvar: pathvar.filter(function(e){return typeof e == "string";}),
                bash: true
            };
            objects.scriptLoc = path.join(require('../../mdkpath')().tmpDir, "mdkenv.sh");
            			
			var script = mustache.render( fs.readFileSync(path.join(__dirname, "..", "common", 'mdk.env')).toString(), objects);
            
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
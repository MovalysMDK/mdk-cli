"use strict";


var mustache = require('mustache');
var path = require('path');
var fs = require('fs');
var async = require('async');

var spawnShell = require('../../utils/system/spawnShell');
var runCmd = require('./runCmd');

var gradle = require('./gradle');
var sdk = require('./sdk');
var jdk = require('../common/jdk');
var maven = require('../common/maven');



module.exports = function( projectConf, devToolsSpecs, osName, callback ){
	
	var pathvar = [];
	var env = [];
	
	async.waterfall([
		
		// Grabbing every env instrcutions
		function(cb){
			gradle.getEnv(devToolsSpecs, osName, "android",  function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
		function(cb){
			sdk.getEnv(devToolsSpecs, osName, "android", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
		function(cb){
			jdk.getEnv(devToolsSpecs, osName, "android", function(err, addEnv, addPathvar){
				if (err){
					return cb(err);
				}
				env = env.concat(addEnv);
				pathvar = pathvar.concat(addPathvar);
				cb();
			});
		},
		function(cb){
			maven.getEnv(devToolsSpecs, osName, "android", function(err, addEnv, addPathvar){
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
				platform: "android",
				env: env.filter(function(e){return typeof e == "string"}),
				pathvar: pathvar.filter(function(e){return typeof e == "string"})
			};
			( /^win/.test(osName) ? objects.win = true : objects.bash = true );
			
			var script = mustache.render( fs.readFileSync(path.join(__dirname, "..", "common", 'mdk.env')).toString(), objects);
			
			cb(null, script);
		}
		
	], function(err, script){
		if (err){
			return callback(err);
		}
		spawnShell(script,  callback);
		
	});

}
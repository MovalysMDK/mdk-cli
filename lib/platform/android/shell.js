"use strict";


var mustache = require('mustache');
var path = require('path');
var fs = require('fs');
var async = require('async');

var spawnShell = require('../../utils/system/spawnShell');
var runCmd = require('./runCmd');
var gradle = require('./gradle');




module.exports = function( projectConf, devToolsSpecs, osName, callback ){
	
	async.waterfall([
		
		function(cb){
			gradle.getEnv(devToolsSpecs, osName, "android", cb);
		},
		
		function(env, cb){
			console.dir(env);
			cb();
		}
		
	], function(err, env){
		if (err){
			return callback(err);
		}
		
		spawnShell("",  callback);
		
	});

	/*
	var objects = {
		bash: true,
		vars: a,
	};
	
	var out = mustache.render( fs.readFileSync(path.join(process.cwd(), "common", 'mdk.env')).toString(), objects);
	console.log(out);
	*/
}
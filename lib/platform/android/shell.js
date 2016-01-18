"use strict";


var mustache = require('mustache');
var path = require('path');
var fs = require('fs');

var runCmd = require('./runCmd');


module.exports = function( projectConf, devToolsSpecs, osName, callback){
	console.log("Run shell for android");
	/*
	runCmd("getEnv", platform, 'Gathering Env', null, function(err, env){
	
		if (err){
			return callback(err);
		}
		
		console.dir(env);
		
		return callback();
	}); 
	
	
	var objects = {
		bash: true,
		vars: a,
	};
	
	var out = mustache.render( fs.readFileSync(path.join(process.cwd(), "common", 'mdk.env')).toString(), objects);
	console.log(out);
	*/
	
	
	return callback();
}
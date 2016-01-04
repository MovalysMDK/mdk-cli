"use strict";

var assert = require('assert');
var async = require('async');
var spawn = require('child_process').spawn;

var mdkLog = require('../../utils/log');
var runNPMGlobal = require('./npm/runNPMGlobal');

/**
 * Compile html5 project without a generation
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function compile( projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');


	console.log('  HTML5 compile');
	
	async.waterfall([
		
		// [WEBAPP] Running NPM Install
		function(cb){
			runNPMGlobal("npm",
						["i", "--no-optional"],
						{
							cwd: './html5/webapp',
							message: "[WEBAPP] Running NPM Install",
							errorMessage: "Error while running NPM Install on webapp"
						},
						cb);
		},
		
		// [WEBAPP] Running Bower Install
		function(cb){
			runNPMGlobal("bower",
						["install"],
						{
							cwd: './html5/webapp',
							message: "[WEBAPP] Running Bower Install",
							errorMessage: "Error while running Bower Install on webapp"
						},
						cb);
		},
		
		// [WEBAPP] Running Gulp Build
		function(cb){
			runNPMGlobal("gulp",
						["build"],
						{
							cwd: './html5/webapp',
							message: "[WEBAPP] Building with Gulp",
							errorMessage: "Error while running gulp build on webapp"
						},
						cb);
		},
		
		// [CORDOVA] Running NPM Install
		function(cb){
			runNPMGlobal("npm",
						["install", "--no-optional"],
						{
							cwd: './html5/cordova',
							message: "[CORDOVA] Running NPM Install",
							errorMessage: "Error while running npmm install on cordova"
						},
						cb);
		},
		
		// [CORDOVA] Running Gulp build
		function(cb){
			runNPMGlobal("gulp",
						["init", "build"],
						{
							cwd: './html5/cordova',
							message: "[CORDOVA] Building with Gulp",
							errorMessage: "Error while running gulp build on cordova"
						},
						cb);
		}
		
	], function(err){
		return callback(err);
	});
}

module.exports = compile;
"use strict";

var async = require('async');
var exec = require('child_process').exec;

var mdkLog = require('../../../../utils/log');

/**
 * Check if an NPM package is globally installed in the correct version
 * @param toolSpec The tool specs
 * @param callback
 */
function checkNPMPackage (toolSpec, cb) {
	
	exec("npm list -g " + toolSpec.npmName, function(err, stdout, stderr){
		if ( stdout.match(toolSpec.npmName + "@" + toolSpec.version) === null ){
			return cb("Could not find " + toolSpec.name + " or the version is not correct : " + /[─|-] ([a-zA-Z0-9@._\-\(\)]*).*/g.exec(stdout)[1], toolSpec);
		}
		return cb(null, toolSpec);
	});
}

module.exports = checkNPMPackage;
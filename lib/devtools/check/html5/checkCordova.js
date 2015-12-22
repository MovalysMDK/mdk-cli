"use strict";

var assert = require('assert');
var async = require('async');
var clc = require('cli-color');
var exec = require('child_process').exec;

var devToolsSpecs = require('../../specs');
var config = require('../../../config');
var mdkLog = require('../../../utils/log');

/**
 * Check if product installation is ok.
 * @param checkSpec check specification
 * @param toolsSpec environment specification
 * @param osName osName
 * @param platform mobile platform
 * @param callback callback
 */
function check( checkSpec, toolsSpec, osName, platform, callback ) {

    assert.equal(typeof checkSpec, 'object');
    assert.equal(typeof toolsSpec, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // find tool spec for cordova
            devToolsSpecs.findToolSpec(toolsSpec, "cordova", osName, platform, cb);
        },
        function (results, cb) {
            var toolSpec = results[0];
			
            // Check NPM to know if cordova is globally installed
			exec("npm list -g cordova", function(err, stdout, stderr){
				if ( stdout.match("cordova@" + toolSpec.version) === null ){
					return cb("Could not find cordova or the version is not correct : " + stdout.split('─ ')[1], toolSpec);
				}
				
				return cb(null, toolSpec);
			});
        },
        
    ], function(err, toolSpec) {
        if ( err ) {
            mdkLog.ko(toolSpec.name, " check failed: " + err );
            callback(false);
        }
        else {
            // all checks passed, don't need to reinstall
            mdkLog.ok(toolSpec.name, "version: " + toolSpec.version);
            callback(true);
        }
    });
}

module.exports = check;
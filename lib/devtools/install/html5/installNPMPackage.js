"use strict";

var assert = require('assert');
var spawn = require('child_process').spawn;

var config = require('../../../config');
var mdkPath = require('../../../mdkpath')();
var checkNPMPackage = require('../../check/html5/npm/checkNPMPackage');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec tool specification
     * @param devToolsSpec devtools specification
     * @param platform platform name
     * @param osName os name
     * @param callback callback
     */
    check: function( toolSpec, devToolsSpec, platform, osName, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof devToolsSpec, 'object');
        assert.equal(typeof platform, 'string');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');
		
		checkNPMPackage(toolSpec, function(err){
			if (err){
				return callback(false, err);
			}
			return callback(true);
		});

    },

    /**
     * Proceed installation.
     * @param toolSpec toolSpec
     * @param osName osName
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');
		
		// Fixes https://github.com/nodejs/node-v0.x-archive/issues/2318
		var spawnCommand = (process.platform === "win32") ? "npm.cmd" : "npm";
		
		var npmProc = spawn(spawnCommand, ["i", "-g", toolSpec.npmName + "@" + toolSpec.version]);
		npmProc.on('error', function(error){
			return callback("NPM Install failed : " + error);
		});
		npmProc.stdout.on('data', function(d){
			process.stdout.write(d);
		});
		npmProc.stderr.on('data', function(d){
			process.stderr.write(d);
		});
		npmProc.on('close', function(code){
			if (code != 0){
				return callback("NPM Install for " + toolSpec.name + " exited with code " + code +". Check log for errors");
			}
			
			toolSpec.opts.installDir = mdkPath.toolsDir;
			config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, callback);
		});

    },

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, removeDependencies, callback) {
        //nothing to do.
        callback();
    }
};
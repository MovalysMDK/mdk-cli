'use strict';

var assert = require('assert');
var path = require('path');

var getInstallDir = require('./getInstallDir');
var envVars = require("../../../utils/system/envVars");

/**
 * Get environment variables for XCTool
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function getEnv(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, function(err, installDir) {
        if (err) {
            return callback(err);
        }
        else {
			var env = [];
			var pathvar = [
				path.join(installDir, "bin")
			]
            return callback(null, env, pathvar);
        }
    });
}

module.exports = getEnv;
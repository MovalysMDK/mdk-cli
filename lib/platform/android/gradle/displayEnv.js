'use strict';

var assert = require('assert');
var path = require('path');

var getInstallDir = require('./getInstallDir');
var system = require("../../../utils/system");

/**
 * Display environment for gradle
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function displayEnv(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, osName, platform, function(err, installDir) {
        if (err ) {
            callback(err);
        }
        else {
            console.log(system.computeEnvVariableDefinition("GRADLE_USER_HOME", installDir, osName));
            callback();
        }
    });
}

module.exports = displayEnv;
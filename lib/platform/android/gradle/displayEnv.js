'use strict';

var assert = require('assert');
var path = require('path');

var getInstallDir = require('./getInstallDir');

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
            console.log("export GRADLE_USER_HOME=" + installDir);
            callback();
        }
    });
}

module.exports = displayEnv;
'use strict';

var assert = require('assert');
var path = require('path');

var getInstallDir = require('./getInstallDir');

/**
 * Display environment for android sdk.
 * @param toolsSpecs tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function displayEnv(toolsSpecs, osName, platform, callback) {

    assert.equal(typeof toolsSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolsSpecs, osName, platform, function(err, installDir) {
        if (err ) {
            callback(err);
        }
        else {
            console.log("export ANDROID_HOME=" + installDir);
            callback();
        }
    });
}

module.exports = displayEnv;
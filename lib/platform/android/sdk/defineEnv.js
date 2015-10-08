'use strict';

var assert = require('assert');

var getInstallDir = require('./getInstallDir');

/**
 * Define environment for android sdk.
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function defineEnv(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, osName, platform, function(err, installDir) {
        if (err ) {
            callback(err);
        }
        else {
            process.env.ANDROID_HOME = installDir;
            callback();
        }
    });
}

module.exports = defineEnv;
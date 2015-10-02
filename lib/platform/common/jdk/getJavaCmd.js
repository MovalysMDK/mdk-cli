'use strict';

var assert = require('assert');
var path = require('path');
var system = require('../../../utils/system');

var getInstallDir = require('./getInstallDir');

/**
 * Compute java command to use
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function getJavaCmd(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, osName, platform, function (err, jdkHome) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, path.join(jdkHome, "bin", "java"));
        }
    });
}

module.exports = getJavaCmd;
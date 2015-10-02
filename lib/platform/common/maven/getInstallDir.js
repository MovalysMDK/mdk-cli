'use strict';

var assert = require('assert');
var path = require('path');
var system = require('../../../utils/system');
var devToolsSpecs = require('../../../devtools/specs');

/**
 * Get installation directory of maven.
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function getInstallDir(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    devToolsSpecs.getToolInstallDir(toolSpecs, "apache-maven", osName, platform, function (err, installDir) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, installDir);
        }
    });
}

module.exports = getInstallDir;
'use strict';

var path = require('path');
var system = require('../../../utils/system');
var assert = require('assert');

var devToolsSpecs = require('../../../devtools/specs');

/**
 * Compute maven command to use
 * @param toolsSpec tools specification
 * @param callback callback
 */
function getInstallDir(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    devToolsSpecs.getToolInstallDir(toolSpecs, "xctool", "osx", "ios", function (err, installDir) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, installDir);
        }
    });
}

module.exports = getInstallDir;
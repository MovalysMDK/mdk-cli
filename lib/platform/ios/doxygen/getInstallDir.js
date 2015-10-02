'use strict';

var assert = require('assert');
var path = require('path');

var system = require('../../../utils/system');
var devToolsSpecs = require('../../../devtools/specs');

/**
 * Get doxygen installation directory.
 * @param toolsSpec tools specification
 * @param callback callback
 */
function getInstallDir(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    devToolsSpecs.getToolInstallDir(toolSpecs, "doxygen", "osx", "ios", function (err, installDir) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, installDir);
        }
    });
}

module.exports = getInstallDir;
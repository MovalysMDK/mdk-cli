'use strict';

var assert = require('assert');
var path = require('path');

var system = require('../../../utils/system');
var getInstallDir = require('./getInstallDir');

/**
 * Compute maven command to use
 * @param toolsSpec tools specification
 * @param callback callback
 */
function getPodCmd(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, function (err, cocoapodsHome) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, path.join(cocoapodsHome, "bin", "pod"));
        }
    });
}

module.exports = getPodCmd;
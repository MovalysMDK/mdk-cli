'use strict';

var assert = require('assert');
var path = require('path');
var system = require('../../../utils/system');

var getInstallDir = require('./getInstallDir');

/**
 * Compute xctool command to use
 * @param toolsSpec tools specification
 * @param callback callback
 */
function getXctoolCmd(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, function (err, xctoolHome) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, path.join(xctoolHome, "bin", "xctool"));
        }
    });
}

module.exports = getXctoolCmd;
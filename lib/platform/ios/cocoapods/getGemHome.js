'use strict';

var assert = require('assert');
var path = require('path');

var system = require('../../../utils/system');
var getInstallDir = require('./getInstallDir');

/**
 * Compute GEM_HOME directory
 * @param toolsSpec tools specification
 * @param callback callback
 */
function getGemHome(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, function (err, cocoapodsHome) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, path.join(cocoapodsHome, "lib"));
        }
    });
}

module.exports = getGemHome;
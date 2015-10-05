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

    //use cocoapod gem to find gem_home
    getInstallDir(toolSpecs, function (err, installDir) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, path.join(installDir, "lib"));
        }
    });
}

module.exports = getGemHome;
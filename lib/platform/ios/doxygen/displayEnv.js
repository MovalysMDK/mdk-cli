'use strict';

var assert = require('assert')
var path = require('path');

var getInstallDir = require('./getInstallDir');

/**
 * Display environment for doxygen
 * @param toolsSpec tools specification
 * @param callback callback
 */
function displayEnv(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, function(err, installDir) {
        if (err ) {
            callback(err);
        }
        else {
            console.log("export PATH=" + path.join(installDir, "bin") + ":$PATH");
            callback();
        }
    });
}

module.exports = displayEnv;
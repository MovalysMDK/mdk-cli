'use strict';

var assert = require('assert');
var path = require('path');

var getInstallDir = require('./getInstallDir');
var envVars = require("../../../utils/system/envVars");

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
            console.log(envVars.computeAppendToPath(path.join(installDir, "bin"), "osx" ));
            callback();
        }
    });
}

module.exports = displayEnv;
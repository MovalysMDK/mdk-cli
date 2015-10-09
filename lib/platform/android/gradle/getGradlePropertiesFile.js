'use strict';

var assert = require('assert');
var path = require('path');

var getInstallDir = require('./getInstallDir');

/**
 * Get gradle.properties location.
 * @param toolSpecs specifications of tools
 * @param osName osName
 * @param callback callback
 */
function getGradlePropertiesFile(toolSpecs, osName, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, osName, "android", function(err, installDir) {
        if ( err) {
            callback(err);
        }
        else {
            callback(null, path.join(installDir, "gradle.properties"));
        }
    });
}

module.exports = getGradlePropertiesFile;
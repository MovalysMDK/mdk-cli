'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../utils/system');
var config = require('../../../config');

/**
 * Check the doxygen version.
 * @param requiredVersion required version.
 * @param installDir directory where doxygen is installed.
 * @param callback callback
 */
function checkDoxygenVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var version = requiredVersion;

    var doxygenFile = path.join(installDir, 'bin', 'doxygen');

    var spawn = child_process.spawn(doxygenFile, ['--version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('doxygen command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {
        output = output.toString().split('\n')[0];
        var doxygenVersion = output;
        if (doxygenVersion) {
            if ( doxygenVersion.substring(0, version.length) === version ) {
                callback(null, doxygenVersion);
            }
            else {
                callback('bad doxygen version: ' + doxygenVersion + '. Required version is : ' + version);
            }
        } else {
            callback('doxygen command failed');
        }
    });
}

module.exports = checkDoxygenVersion;
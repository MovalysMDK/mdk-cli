'use strict'

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../utils/system');
var config = require('../../../config');

/**
 * Check the cocoapods version.
 * @param requiredVersion required version.
 * @param installDir directory where cocoapods is installed.
 * @param callback callback
 */
function checkCocoapodsVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');


    var cocoapodsFile = path.join(installDir, "bin", "pod");

    var spawn = child_process.spawn(cocoapodsFile, ['--version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('pod command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {

        // remove line breaks in output
        var cocoapodsVersion = output.replace(/(\r\n|\n|\r)/gm,"");
        if (cocoapodsVersion != false) {

            if ( cocoapodsVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                callback(null, cocoapodsVersion);
            }
            else {
                callback('bad cocoapods version: ' + cocoapodsVersion + '. Required version is : ' + requiredVersion);
            }
        } else {
            callback('pod command failed');
        }
    });
}

module.exports = checkCocoapodsVersion;
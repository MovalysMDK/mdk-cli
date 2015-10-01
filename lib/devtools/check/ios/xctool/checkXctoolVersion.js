'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../../utils/system/index');
var config = require('../../../../config/index');

/**
 * Check the xctool version.
 * @param requiredVersion required version.
 * @param installDir directory where xctool is installed.
 * @param callback callback
 */
function checkXctoolVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');


    var xctoolFile = path.join(installDir, "bin", "xctool");

    var spawn = child_process.spawn(xctoolFile, ['--version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('xctool command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {

        var xctoolVersion = output;
        if (xctoolVersion !== false) {

            if ( xctoolVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                callback(null, xctoolVersion);
            }
            else {
                callback('bad xctool version: ' + xctoolVersion + '. Required version is : ' + requiredVersion);
            }
        } else {
            callback('xctool command failed');
        }
    });
}

module.exports = checkXctoolVersion;
'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../../utils/system/index');
var config = require('../../../../config/index');

/**
 * Check the xcproj version.
 * @param requiredVersion required version.
 * @param installDir directory where xcproj is installed.
 * @param callback callback
 */
function checkXcprojVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');


    var xcprojFile = path.join(installDir, "bin", "xcproj");

    var spawn = child_process.spawn(xcprojFile, ['--version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('xcproj command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {

        var xcprojVersion = output;
        if (xcprojVersion !== false) {

            if ( xcprojVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                callback(null, xcprojVersion);
            }
            else {
                callback('bad xcproj version: ' + xcprojVersion + '. Required version is : ' + requiredVersion);
            }
        } else {
            callback('xcproj command failed');
        }
    });
}

module.exports = checkXcprojVersion;
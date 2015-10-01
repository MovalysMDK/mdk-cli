'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../../utils/system/index');
var config = require('../../../../config/index');

/**
 * Check the uncrustify version.
 * @param requiredVersion required version.
 * @param installDir directory where uncrustify is installed.
 * @param callback callback
 */
function checkUncrustifyVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var version = requiredVersion;

    var uncrustifyFile = path.join(installDir, 'bin', 'uncrustify');

    var spawn = child_process.spawn(uncrustifyFile, ['--version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('uncrustify command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {
        output = output.toString().split('\n')[0];
        var uncrustifyVersion = new RegExp('uncrustify').test(output) ? output.split(' ')[1] : false;
        if (uncrustifyVersion !== false) {
            if ( uncrustifyVersion.substring(0, version.length) === version ) {
                callback(null, uncrustifyVersion);
            }
            else {
                callback('bad uncrustify version: ' + uncrustifyVersion + '. Required version is : ' + version);
            }
        } else {
            callback('uncrustify command failed');
        }
    });
}

module.exports = checkUncrustifyVersion;
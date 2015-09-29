'use strict'

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../utils/system');
var config = require('../../../config');

/**
 * Check the mvn version.
 * @param requiredVersion required version.
 * @param installDir directory where maven is installed.
 * @param callback callback
 */
function checkMavenVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');


    var mavenFile = path.join(installDir, "bin", "mvn");

    var spawn = child_process.spawn(mavenFile, ['--version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('mvn command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {

        var mavenVersion = new RegExp('Apache Maven').test(output) ? output.split(' ')[2] : false;
        if (mavenVersion != false) {

            if ( mavenVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                callback(null, mavenVersion);
            }
            else {
                callback('bad maven version: ' + mavenVersion + '. Required version is : ' + requiredVersion);
            }
        } else {
            callback('mvn command failed');
        }
    });
}

module.exports = checkMavenVersion;
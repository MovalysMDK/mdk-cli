'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../../utils/system/index');
var config = require('../../../../config/index');

/**
 * Check the jdk version.
 * @param requiredVersion required version.
 * @param installDir directory where java is installed.
 * @param callback callback
 */
function checkJavaVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var index = requiredVersion.lastIndexOf('.');
    var version = requiredVersion.substr(0, index) + '_' + requiredVersion.substr(index+1);

    var javaFile = path.join(installDir, "bin", "java");

    var spawn = child_process.spawn(javaFile, ['-version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('java command failed');
    });

    spawn.stderr.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {
        output = output.toString().split('\n')[0];
        var javaVersion = new RegExp('java version').test(output) ? output.split(' ')[2].replace(/"/g, '') : false;
        if (javaVersion !== false) {

            if ( javaVersion.substring(0, version.length) === version ) {
                callback(null, javaVersion);
            }
            else {
                callback('bad java version: ' + javaVersion + '. Required version is : ' + version);
            }
        } else {
            callback('java command failed');
        }
    });
}

module.exports = checkJavaVersion;
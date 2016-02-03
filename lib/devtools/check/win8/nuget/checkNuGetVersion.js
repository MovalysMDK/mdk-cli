'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../../utils/system/index');
var config = require('../../../../config/index');

/**
 * Check the nuget version.
 * @param requiredVersion required version.
 * @param installDir directory where nuget is installed.
 * @param callback callback
 */
function checkNuGetVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var nugetFile = path.join(installDir, "nuget.exe");

    var params = [];
    var command = nugetFile;

    var isWin = /^win/.test(process.platform);
    if ( isWin) {
        params = ['/c', command].concat(params);
        command = 'cmd';
    }

    var spawn = child_process.spawn(command, params);
    var output = '' ;

    spawn.on('error', function(err) {
        console.log("err:" + err);
        callback('nuget command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {

        var nugetVersion = new RegExp('nuget').test(output) ? output.split(' ')[2] : false;
        if (nugetVersion !== false) {

            if ( nugetVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                callback(null, nugetVersion);
            }
            else {
                callback('bad nuget version: ' + nugetVersion + '. Required version is : ' + requiredVersion);
            }
        } else {
            callback('nuget command failed');
        }
    });
}

module.exports = checkNuGetVersion;
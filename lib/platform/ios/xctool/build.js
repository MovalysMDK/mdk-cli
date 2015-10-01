'use strict';

var assert = require('assert');
var spawn = require('child_process').spawn;

var system = require('../../../utils/system');

/**
 * Build xcode project with xctool
 * @param projectConf project configuration
 * @param clean clean project
 * @param callback callback
 */
function build(projectConf, clean, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof clean, 'boolean');
    assert.equal(typeof callback, 'function');

    //TODO: compute path to xctool

    var stdout = '';
    var stderr = '';
    var error = '';

    var xctoolBuildCmd = 'xctool';
    var xctoolBuildArgs = [
        '-workspace',
            projectConf.project.artifactId + '.xcworkspace',
        '-scheme',
        projectConf.project.artifactId,
        '-configuration',
        'Debug',
        '-sdk',
        'iphoneos',
        '-derivedDataPath',
        './build',
        '-reporter',
        'plain'
    ];

    if ( clean ) {
        xctoolBuildArgs.push('clean');
    }
    xctoolBuildArgs.push('build');
    if ( projectConf.ios.codeSignIdentity) {
        xctoolBuildArgs.push('CODE_SIGN_IDENTITY=' + projectConf.ios.codeSignIdentity);
    }
    if ( projectConf.ios.provisioningProfile) {
        xctoolBuildArgs.push('PROVISIONING_PROFILE=' + projectConf.ios.provisioningProfile);
    }

    var cmd = spawn(xctoolBuildCmd, xctoolBuildArgs, { encoding: 'utf8', stdio: 'pipe' } );

    cmd.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    cmd.stderr.on('data', function (data) {
        console.log(data.toString());
    });

    cmd.on('error', function (err) {
        console.log(err);
    });

    cmd.on('close', function (code) {
        if (code !== 0) {
            callback('xctool build failed: '+ xctoolBuildCmd + ' ' + xctoolBuildArgs );
        }
        else {
            callback(null, stdout);
        }
    });
}

module.exports = build;
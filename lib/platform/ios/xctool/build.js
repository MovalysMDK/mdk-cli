'use strict';

var assert = require('assert');
var spawn = require('child_process').spawn;

var system = require('../../../utils/system');
var getXctoolCmd = require('./getXctoolCmd');

/**
 * Build xcode project with xctool
 * @param projectConf project configuration
 * @param clean clean project
 * @param toolSpecs devtools specification
 * @param callback callback
 */
function build(projectConf, clean, toolSpecs, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof clean, 'boolean');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    //TODO: CODE_SIGN_IDENTITY + PROVISIONING_PROFILE

    getXctoolCmd( toolSpecs, function(err, xctoolCmd) {
        if ( err) {
            callback(err);
        }
        else {
            var stdout = '';
            var stderr = '';
            var error = '';

            var xctoolBuildCmd = xctoolCmd;
            var xctoolBuildArgs = [
                '-workspace',
                projectConf.project.artifactId + '.xcworkspace',
                '-scheme',
                projectConf.project.artifactId,
                '-configuration',
                'Debug',
                '-sdk',
                'iphonesimulator',
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

            var maxBufferSize = 2000 * 1024;
            var cmd = spawn(xctoolBuildCmd, xctoolBuildArgs, { encoding: 'utf8', stdio: ['pipe', process.stdout, process.stderr], maxBuffer: maxBufferSize } );

            cmd.on('error', function (err) {
                console.log(err);
            });

            cmd.on('close', function (code) {
                if (code !== 0) {
                    callback('xctool build failed: '+ xctoolBuildCmd + ' ' + xctoolBuildArgs );
                }
                else {
                    callback();
                }
            });
        }
    });
}

module.exports = build;
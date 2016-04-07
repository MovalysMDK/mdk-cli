/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
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
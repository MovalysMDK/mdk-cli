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

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var child_process = require('child_process');

var system = require('../../../../utils/system/index');
var config = require('../../../../config/index');

/**
 * Check the mfxcode version.
 * @param requiredVersion required version.
 * @param installDir directory where mfxcode is installed.
 * @param callback callback
 */
function checkMfxcodeVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');


    var mfxcodeFile = path.join(installDir, "bin", "mfxcode");

    var spawn = child_process.spawn(mfxcodeFile, ['version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('mfxcode command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {

        var mfxcodeVersion = new RegExp('MFXcode version:').test(output) ? output.split(' ')[2] : false;
        if (mfxcodeVersion !== false) {

            if ( mfxcodeVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                callback(null, mfxcodeVersion);
            }
            else {
                callback('bad mfxcode version: ' + mfxcodeVersion + '. Required version is : ' + requiredVersion);
            }
        } else {
            callback('mfxcode command failed');
        }
    });
}

module.exports = checkMfxcodeVersion;
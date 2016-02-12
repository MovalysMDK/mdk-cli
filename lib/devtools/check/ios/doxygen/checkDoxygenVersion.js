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
 * Check the doxygen version.
 * @param requiredVersion required version.
 * @param installDir directory where doxygen is installed.
 * @param callback callback
 */
function checkDoxygenVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var version = requiredVersion;

    var doxygenFile = path.join(installDir, 'bin', 'doxygen');

    var spawn = child_process.spawn(doxygenFile, ['--version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('doxygen command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {
        output = output.toString().split('\n')[0];
        var doxygenVersion = output;
        if (doxygenVersion) {
            if ( doxygenVersion.substring(0, version.length) === version ) {
                callback(null, doxygenVersion);
            }
            else {
                callback('bad doxygen version: ' + doxygenVersion + '. Required version is : ' + version);
            }
        } else {
            callback('doxygen command failed');
        }
    });
}

module.exports = checkDoxygenVersion;
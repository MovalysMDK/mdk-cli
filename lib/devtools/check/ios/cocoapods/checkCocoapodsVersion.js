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
 * Check the cocoapods version.
 * @param requiredVersion required version.
 * @param installDir directory where cocoapods is installed.
 * @param callback callback
 */
function checkCocoapodsVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var cocoapodsFile = path.join(installDir, "bin", "pod");

    var spawn = child_process.spawn(cocoapodsFile, ['--version']);
    var output = '' ;

    spawn.on('error', function(err) {
        callback('pod command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {

        // remove line breaks in output
        var cocoapodsVersion = output.replace(/(\r\n|\n|\r)/gm,"");
        if (cocoapodsVersion !== false) {

            if ( cocoapodsVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                callback(null, cocoapodsVersion);
            }
            else {
                callback('bad cocoapods version: ' + cocoapodsVersion + '. Required version is : ' + requiredVersion);
            }
        } else {
            callback('pod command failed');
        }
    });
}

module.exports = checkCocoapodsVersion;
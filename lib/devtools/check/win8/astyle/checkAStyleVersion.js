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
 * Check the astyle version.
 * @param requiredVersion required version.
 * @param installDir directory where astyle is installed.
 * @param callback callback
 */
function checkastyleVersion( requiredVersion, installDir, callback ) {

    assert.equal(typeof requiredVersion, 'string');
    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var astyleFile = path.join(installDir, "bin", "astyle");

    var params = ['--version'];
    var command = astyleFile;

    var isWin = /^win/.test(process.platform);
    if ( isWin) {
        params = ['/c', command].concat(params);
        command = 'cmd';
    }

    var spawn = child_process.spawn(command, params);
    var output = '' ;

    spawn.on('error', function(err) {
        console.log("err:" + err);
        return callback('astyle command failed');
    });

    spawn.stdout.on('data', function(data) {
        output += data;
    });

    spawn.on('close', function (code) {

        var astyleVersion = new RegExp('astyle').test(output) ? output.split(' ')[2] : false;
        if (astyleVersion !== false) {

            if ( astyleVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                return callback(null, astyleVersion);
            }
            else {
                return callback('bad astyle version: ' + astyleVersion + '. Required version is : ' + requiredVersion);
            }
        } else {
            return callback('astyle command failed');
        }
    });
}

module.exports = checkastyleVersion;
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

/**
 * Check the directory of cocoapods
 * @param cocoapodsPath directory where cocoapods is installed.
 * @param callback callback
 */
function checkCocoapodsFolder( cocoapodsPath, callback ) {

    assert.equal(typeof cocoapodsPath, 'string');
    assert.equal(typeof callback, 'function');

    var cocoapodsFile = path.join(cocoapodsPath, "bin", "pod");
    // check directory is present
    fs.access(cocoapodsPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + cocoapodsPath + ". err:" + err );
        }
        else {
            // check file cocoapods is present and execute
            fs.access(cocoapodsFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("pod command does not exist or is not executable: " + cocoapodsFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkCocoapodsFolder;
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
 * Check the directory of doxygen
 * @param doxygenPath directory where doxygen is installed.
 * @param callback callback
 */
function checkDoxygenFolder( doxygenPath, callback ) {

    var doxygenFile = path.join(doxygenPath, 'bin', 'doxygen');

    // check directory is present
    fs.access(doxygenPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + doxygenPath + ". err:" + err );
        }
        else {
            // check file doxygen is present and execute
            fs.access(doxygenFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("doxygen command does not exist or is not executable: " + doxygenFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkDoxygenFolder;
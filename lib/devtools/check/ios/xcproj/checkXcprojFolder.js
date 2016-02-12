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
 * Check the directory of xcproj
 * @param xcprojPath directory where xcproj is installed.
 * @param callback callback
 */
function checkXcprojFolder( xcprojPath, callback ) {

    var xcprojFile = path.join(xcprojPath, "bin", "xcproj");
    // check directory is present
    fs.access(xcprojPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + xcprojPath + ". err:" + err );
        }
        else {
            // check file xcproj is present and execute
            fs.access(xcprojFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("xcproj command does not exist or is not executable: " + xcprojFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkXcprojFolder;
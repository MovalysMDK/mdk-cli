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
 * Check the directory of mvn
 * @param mavenPath directory where maven is installed.
 * @param callback callback
 */
function checkMavenFolder( mavenPath, callback ) {

    var mavenFile = path.join(mavenPath, "bin", "mvn");

    // check directory is present
    fs.access(mavenPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + mavenPath + ". err:" + err );
        }
        else {
            // check file maven is present and execute
            fs.access(mavenFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("mvn command does not exist or is not executable: " + mavenFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkMavenFolder;
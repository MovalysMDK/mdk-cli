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
 * Check the directory of mfxcode
 * @param mfxcodePath directory where mfxcode is installed.
 * @param callback callback
 */
function checkMfxcodeFolder( mfxcodePath, callback ) {

    var mfxcodeFile = path.join(mfxcodePath, "bin", "mfxcode");
    // check directory is present
    fs.access(mfxcodePath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + mfxcodePath + ". err:" + err );
        }
        else {
            // check file mfxcode is present and execute
            fs.access(mfxcodeFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("mfxcode command does not exist or is not executable: " + mfxcodeFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkMfxcodeFolder;
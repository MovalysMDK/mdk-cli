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

var system = require('../../../../utils/system');

/**
 * Check the directory of android-sdk
 * @param androidSdkPath directory where android sdk is installed.
 * @param osName The OS name where to install android sdk.
 * @param callback callback
 */
function checkAndroidSdkFolder( androidSdkPath, osName, callback ) {

    assert(typeof androidSdkPath === 'string');
    assert(typeof osName === 'string');
    assert(typeof callback === 'function');
    
    var androidExec = path.join(androidSdkPath, "tools", system.computeCommand('android', osName, false, {"win":"bat"}));

    // check directory is present
    fs.access(androidSdkPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + androidSdkPath + ". err:" + err );
        }
        else {
            // check file "tools/android" is present and executable
            fs.access(androidExec, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("android command does not exist or is not executable: " + androidExec + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}

module.exports = checkAndroidSdkFolder;
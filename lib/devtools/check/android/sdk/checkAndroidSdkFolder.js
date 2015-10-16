'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');

/**
 * Check the directory of android-sdk
 * @param androidSdkPath directory where android sdk is installed.
 * @param osName The OS name where to install android sdk.
 * @param callback callback
 */
function checkAndroidSdkFolder( androidSdkPath, osName, callback ) {

    var androidExec = path.join(androidSdkPath, "tools", computeJavaExecutableName(osName));

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

/**
 * Compute the name of binary/executable of 'android' given an OS
 * @param osName The name of OS where to check java
 * @returns The name of the binary/executable of java to check
 */
function computeJavaExecutableName(osName) {
    assert(typeof osName,  'string');

    var result;
    switch(osName) {
        case 'win':
            result = 'android.bat';
            break;
        case 'osx':
        case 'linux':
            result = 'android';
            break;
        default :
            result = 'android';
    }
    return result;
}

module.exports = checkAndroidSdkFolder;
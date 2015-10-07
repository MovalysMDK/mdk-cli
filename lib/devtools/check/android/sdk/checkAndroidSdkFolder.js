'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');

/**
 * Check the directory of android-sdk
 * @param androidSdkPath directory where android sdk is installed.
 * @param callback callback
 */
function checkAndroidSdkFolder( androidSdkPath, callback ) {

    var androidExec = path.join(androidSdkPath, "tools", "android");

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
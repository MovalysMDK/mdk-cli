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
'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');

/**
 * Check the directory of xctool
 * @param xctool directory where xctool is installed.
 * @param callback callback
 */
function checkXctoolFolder( xctoolPath, callback ) {

    var xctoolFile = path.join(xctoolPath, "bin", "xctool");
    // check directory is present
    fs.access(xctoolPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + xctoolPath + ". err:" + err );
        }
        else {
            // check file xctool is present and execute
            fs.access(xctoolFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("xctool command does not exist or is not executable: " + xctoolFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkXctoolFolder;
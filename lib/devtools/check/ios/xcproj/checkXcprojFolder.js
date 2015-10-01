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
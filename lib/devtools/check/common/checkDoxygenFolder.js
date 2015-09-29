'use strict'

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
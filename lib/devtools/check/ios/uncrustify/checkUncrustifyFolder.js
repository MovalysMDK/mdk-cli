'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');

/**
 * Check the directory of uncrustify
 * @param uncrustifyPath directory where uncrustify is installed.
 * @param callback callback
 */
function checkUncrustifyFolder( uncrustifyPath, callback ) {

    var uncrustifyFile = path.join(uncrustifyPath, 'bin', 'uncrustify');

    // check directory is present
    fs.access(uncrustifyPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + uncrustifyPath + ". err:" + err );
        }
        else {
            // check file uncrustify is present and execute
            fs.access(uncrustifyFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("uncrustify command does not exist or is not executable: " + uncrustifyFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkUncrustifyFolder;
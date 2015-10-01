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
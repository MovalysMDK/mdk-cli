'use strict'

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');

/**
 * Check the directory of jdk
 * @param javaPath directory where jdk is installed.
 * @param callback callback
 */
function checkJavaFolder( javaPath, callback ) {

    var javaFile = path.join(javaPath, "bin", "java");

    // check directory is present
    fs.access(javaPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + javaPath + ". err:" + err );
        }
        else {
            // check file java is present and execute
            fs.access(javaFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("java command does not exist or is not executable: " + javaFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkJavaFolder;
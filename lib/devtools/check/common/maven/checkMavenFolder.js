'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');

/**
 * Check the directory of mvn
 * @param mavenPath directory where maven is installed.
 * @param callback callback
 */
function checkMavenFolder( mavenPath, callback ) {

    var mavenFile = path.join(mavenPath, "bin", "mvn");

    // check directory is present
    fs.access(mavenPath, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + mavenPath + ". err:" + err );
        }
        else {
            // check file maven is present and execute
            fs.access(mavenFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                if ( err ) {
                    callback("mvn command does not exist or is not executable: " + mavenFile + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkMavenFolder;
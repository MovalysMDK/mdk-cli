'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var system = require('../../../../utils/system');
var mdkpath = require('../../../../mdkpath');

/**
 * Check the directory of gradle.
 * @param installDir directory where gradle is installed.
 * @param callback callback
 */
function checkGradleFolder( installDir, callback ) {

    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var gradleProperties = path.join(mdkpath().confDir, "gradle-template.properties");

    // check directory is present
    fs.access(installDir, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + installDir + ". err:" + err );
        }
        else {
            // check file gradle-template.properties exists.
            fs.access(gradleProperties, fs.F_OK | fs.R_OK, function(err) {
                if ( err ) {
                    callback("file does not exist:" + gradleProperties + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkGradleFolder;
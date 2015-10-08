'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var async = require('async');

/**
 * Check build tools are installed.
 * @param androidSdkPath directory where android sdk is installed.
 * @param toolSpec tool specification
 * @param callback callback
 */
function checkAndroidBuildTools( androidSdkPath, toolSpec, callback ) {

    assert.equal(typeof androidSdkPath, 'string');
    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof callback, 'function');

    var buildToolsVersion = toolSpec.packages[0].opts.buildTools;
    var buildToolsSourcePropsFile = path.join(androidSdkPath, "build-tools", buildToolsVersion, "source.properties");
    fs.access(buildToolsSourcePropsFile, fs.F_OK | fs.R_OK, function(err) {
        if ( err) {
            callback("missing android build tools: " + buildToolsVersion);
        }
        else {
            callback();
        }
    });
}
module.exports = checkAndroidBuildTools;
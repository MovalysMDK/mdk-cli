'use strict';

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var async = require('async');

/**
 * Check the directory of android-sdk
 * @param androidSdkPath directory where android sdk is installed.
 * @param toolSpec tool specification.
 * @param callback callback
 */
function checkAndroidApi( androidSdkPath, toolSpec, callback ) {

    assert.equal(typeof androidSdkPath, 'string');
    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof callback, 'function');

    var missingApi = [];
    async.eachSeries(toolSpec.packages[0].opts.api, function(api, cb) {
        var apiSourcePropsFile = path.join(androidSdkPath, "platforms", "android-" + api, "source.properties");
        fs.access(apiSourcePropsFile, fs.F_OK | fs.R_OK, function(err) {
            if ( err) {
                missingApi.push(api);
            }
            cb();
        });
    },
    function done() {
        if ( missingApi.length > 0 ) {
            callback("missing android platfom api: " + missingApi );
        }
        else {
            callback();
        }
    });
}
module.exports = checkAndroidApi;
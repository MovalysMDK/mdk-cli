'use strict';

var async = require('async');
var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');

var system = require('../../../utils/system');
var devToolsSpecs = require('../../specs');
var osName = require('../../../utils/system/osName');
var config = require('../../../config');

/**
 * Default installation script for dev tools.
 * @param toolSpec toolSpec
 * @param callback callback
 */
function removeInstallDir( toolSpec, callback) {

    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
        },
        function(installDir, cb) {
            if ( typeof installDir !== "undefined" ) {
                fs.remove(installDir, function (err) {
                    cb(err);
                });
            }
            else {
                cb();
            }
        }
    ], function(err) {
        callback(err);
    });
}

module.exports = removeInstallDir;
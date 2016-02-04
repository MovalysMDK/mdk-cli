'use strict';

var async = require('async');
var assert = require('assert');

var findToolSpec = require('./findToolSpec');
var config = require('../../config');

/**
 * Find install directory for a tool
 * @param toolsSpec devtool specification
 * @param toolName tool name
 * @param platform mobile platform
 * @param callback callback
 */
function getToolInstallDir( toolsSpec, toolName, osName, platformName, callback ) {

    assert.equal(typeof toolsSpec, 'object');
    assert.equal(typeof toolName, 'string');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // find tool spec
            findToolSpec(toolsSpec, toolName, osName, platformName, cb);
        },
        function (results, cb) {
            var toolSpec = results[0];
            // read configuration to know where tool is installed.
            config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                if (err || typeof installDir === 'undefined') {
                    cb("Tool '" + toolName + "' is not installed.");
                }
                else {
                    cb(null, installDir);
                }
            });
        }
    ], function(err, installDir ) {
        callback(err, installDir );
    });
}

module.exports = getToolInstallDir;
"use strict";

var assert = require('assert');
var async = require('async');
var clc = require('cli-color');
var exec = require('child_process').exec;

var devToolsSpecs = require('../../specs');
var config = require('../../../config');
var mdkLog = require('../../../utils/log');
var checkNPMPackage = require('./npm/checkNPMPackage');

/**
 * Check if product installation is ok.
 * @param checkSpec check specification
 * @param toolsSpec environment specification
 * @param osName osName
 * @param platform mobile platform
 * @param callback callback
 */
function check( checkSpec, toolsSpec, osName, platform, callback ) {

    assert.equal(typeof checkSpec, 'object');
    assert.equal(typeof toolsSpec, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // find tool spec for bower
            devToolsSpecs.findToolSpec(toolsSpec, "bower", osName, platform, cb);
        },
        function (results, cb) {
            var spec = results[0];
            checkNPMPackage( spec, cb );
        },
        
    ], function(err, toolSpec) {
        if ( err ) {
            mdkLog.ko(toolSpec.name, " check failed: " + err );
            callback(false);
        }
        else {
            // all checks passed, don't need to reinstall
            mdkLog.ok(toolSpec.name, "version: " + toolSpec.version);
            callback(true);
        }
    });
}

module.exports = check;
"use strict";

var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var assert = require('assert');
var async = require('async');
var clc = require('cli-color');
var semver = require('semver');

var system = require('../../../utils/system/index');
var config = require('../../../config/index');
var devToolsSpecs = require('../../specs/index');
var mdkLog = require('../../../utils/log');

var checkDoxygenFolder = require('./doxygen/checkDoxygenFolder');
var checkDoxygenVersion = require('./doxygen/checkDoxygenVersion');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param checkSpec check specification
     * @param devToolsSpec environment specification
     * @param osName osName
     * @param platform mobile platform
     * @param callback callback
     */
    check: function( checkSpec, devToolsSpec, osName, platform, callback ) {

        assert.equal(typeof checkSpec, 'object');
        assert.equal(typeof devToolsSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof platform, 'string');
        assert.equal(typeof callback, 'function');

        var spawn = child_process.spawn('xcodebuild', ['-version']);
        var output = '' ;


        spawn.stdout.on('data', function(data) {
            output += data;
        });
        var requiredVersion = checkSpec.opts.minVersion;

        async.waterfall( [
            function (cb) {
                spawn.on('error', function(err) {
                    cb('xcodebuild command failed');
                });
                cb();
            },
            function (cb) {
                spawn.on('close', function (code) {
                    output = output.toString().split('\n')[0];
                    var xcodeCommandLineToolsVersion = new RegExp('Xcode ').test(output) ? output.split(' ')[1] : false;
                    normalizeXcodeVersion(xcodeCommandLineToolsVersion, function (normalizedVersion) {
                        if (xcodeCommandLineToolsVersion !== false) {
                            if ( semver.gte(normalizedVersion, requiredVersion) ) {
                                cb(null, xcodeCommandLineToolsVersion);
                            }
                            else {
                                cb('bad Xcode version: ' + xcodeCommandLineToolsVersion + '. Minimum required version is : ' + requiredVersion);
                            }
                        } else {
                            cb('xcodebuild command failed');
                        }
                    });
                });
            }], function(err, currentVersion) {
            if ( err ) {
                var indication =  err;
                indication = indication + '\n';
                indication = indication + clc.red.bold('     You need to install a minimum required version of Xcode (' + requiredVersion + ') with its associated Command Line Tools');
                mdkLog.ko("XCode", " check failed: " + indication );
                callback(false);
            }
            else {
                // all checks passed, don't need to reinstall
                mdkLog.ok("XCode", "version: " + currentVersion);
                callback(true);
            }
        });

    }
};

function normalizeXcodeVersion(version, callback) {
    if(version.split(".").length === 2) {
        version = version + ".0";
    }
    callback(version);
}
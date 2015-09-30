"use strict";

var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var assert = require('assert');
var async = require('async');
var clc = require('cli-color');

var system = require('../../../utils/system');
var config = require('../../../config');
var devToolsSpecs = require('../../specs');

var checkCocoapodsFolder = require('./checkCocoapodsFolder');
var checkCocoapodsVersion = require('./checkCocoapodsVersion');

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

        async.waterfall( [
            function (cb) {
                // find tool spec for maven
                devToolsSpecs.findToolSpec(devToolsSpec, "cocoapods", osName, platform, cb);
            },
            function (results, cb) {
                var toolSpec = results[0];
                // read configuration to know where maven is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                    if (err || typeof installDir === 'undefined') {
                        cb("Not installed");
                    }
                    else {
                        cb(null, toolSpec, installDir);
                    }
                });
            },
            function ( toolSpec, installDir, cb) {
                // check directory of maven is ok.
                checkCocoapodsFolder( installDir, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, toolSpec, installDir);
                    }
                });
            },
            function ( toolSpec, installDir, cb) {
                // check maven version
                checkCocoapodsVersion( toolSpec.version, installDir, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, toolSpec, installDir);
                    }
                });
            }
        ], function(err, toolSpec) {
            if ( err ) {
                console.log(clc.red('[KO]') + " cocoapods check failed: " + err );
                callback(false);
            }
            else {
                // all checks passed, don't need to reinstall
                console.log(clc.green('[OK]') + " cocoapods version: " + toolSpec.version );
                callback(true);
            }
        });
    }
};
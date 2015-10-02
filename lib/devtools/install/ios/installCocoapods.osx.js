"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');

var checkCocoapodsVersion = require('../../check/ios/cocoapods/checkCocoapodsVersion');
var checkCocoapodsFolder = require('../../check/ios/cocoapods/checkCocoapodsFolder');

var system = require('../../../utils/system');
var config = require('../../../config');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec toolSpec
     * @param callback callback
     */
    check: function( toolSpec, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof callback, 'function');

        async.waterfall( [
            function (cb) {
                // read configuration to known where cocoapods is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
            },
            function (installDir, cb) {
                if(typeof installDir === 'undefined') {
                    cb("Not installed");
                }
                else {
                    cb(null, installDir);
                }
            },
            function (installDir, cb) {
                checkCocoapodsFolder( installDir, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check cocoapods version
                checkCocoapodsVersion( toolSpec.version, installDir, cb);
            }
        ], function(err) {
            if ( err ) {
                callback(false, err);
            }
            else {
                // all checks passed, don't need to reinstall
                callback(true);
            }
        });
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>delete old directory if exists</li>
     *     <li>install products in directory config.get("devToolsBaseDir") + toolName + toolVersion.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param callback callback
     */
    install: function( toolSpec, callback) {

        var installBinDir = path.join(toolSpec.opts.installDir, toolSpec.opts.binDirectory);
        var installLibDir = path.join(toolSpec.opts.installDir, toolSpec.opts.libDirectory);

        async.waterfall([
            function(cb) {
                fs.ensureDir(toolSpec.opts.installDir, cb);
            },
            function(installDir, cb) {
                console.log("  Installing cocoapods");
                system.spawn('gem', ['install', toolSpec.name, '-v', toolSpec.version, '-n', installBinDir, "-i", installLibDir], function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }

        ], function(err) {
            callback(err);
        });
    },

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, callback) {
        //TODO
        callback();
    }
};
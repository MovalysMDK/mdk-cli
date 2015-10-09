"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var moment = require('moment');

var system = require('../../../utils/system');
var config = require('../../../config');
var checkGradleFolder = require('../../check/android/gradle/checkGradleFolder');

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
                // read configuration to known where maven is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                    if (err || typeof installDir === 'undefined') {
                        cb("Not installed");
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                checkGradleFolder( installDir,function(err) {
                    if (err) {
                        cb("Not installed: " + err );
                    }
                    else {
                        cb(null, installDir);
                    }
                });
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

        var confDir = path.join(system.userHome(), ".mdk", "conf");
        var gradlePropertiesOrig = path.join( __dirname, "gradle.template.properties");
        var gradlePropertiesTo = path.join(confDir, "gradle-template.properties");

        // override computed installDir, remove version number.
        toolSpec.opts.installDir = path.dirname(toolSpec.opts.installDir);
        toolSpec.opts.installDir = path.join(toolSpec.opts.installDir, toolSpec.name);

        async.waterfall([
            function(cb) {
                // create ~/.mdk/tools/conf
                fs.ensureDir(confDir, function(err) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                fs.ensureDir(toolSpec.opts.installDir, function(err) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                // if "gradle-template.properties" already exists, make a backup.
                fs.access(gradlePropertiesTo, fs.W_OK, function(err) {
                    if ( !err) {
                        // make a backup of old template.
                        fs.copy(gradlePropertiesOrig, gradlePropertiesTo + "." + moment(new Date()).format('YYYYMMDD-HHmmss'), function (err) {
                            cb(err);
                        });
                    }
                    else {
                        cb();
                    }
                });
            },
            function (cb) {
                // copy gradle.properties in conf directory.
                fs.copy(gradlePropertiesOrig, gradlePropertiesTo, function (err) {
                    cb(err);
                });
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            },
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
        //nothing to do.
        callback();
    }
};
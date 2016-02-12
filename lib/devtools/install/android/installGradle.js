/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var moment = require('moment');

var mdkpath = require('../../../mdkpath');
var system = require('../../../utils/system');
var config = require('../../../config');
var checkGradleFolder = require('../../check/android/gradle/checkGradleFolder');
var defineEnv = require('../../../platform/android/gradle/defineEnv');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec tool specification
     * @param devToolsSpec devtools specification
     * @param platform platform name
     * @param osName os name
     * @param callback callback
     */
    check: function( toolSpec, devToolsSpec, platform, osName, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof devToolsSpec, 'object');
        assert.equal(typeof platform, 'string');
        assert.equal(typeof osName, 'string');
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
            function ( installDir, cb) {
                defineEnv(devToolsSpec, osName, platform, function(err) {
                    cb(err, installDir);
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
     *     <li>install products in directory $MDK_HOME/tools/gradle.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param osName osName
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        var gradlePropertiesOrig = path.join( __dirname, "gradle.template.properties");
        var gradlePropertiesTo = path.join(mdkpath().confDir, "gradle-template.properties");

        // override computed installDir, remove version number.
        toolSpec.opts.installDir = path.dirname(toolSpec.opts.installDir);
        toolSpec.opts.installDir = path.join(toolSpec.opts.installDir, toolSpec.name);

        async.waterfall([
            function(cb) {
                // create ~/.mdk/tools/conf
                fs.ensureDir(mdkpath().confDir, function(err) {
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
    uninstall: function( toolSpec, removeDependencies, callback) {
        //nothing to do.
        callback();
    }
};
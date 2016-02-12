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
var child_process = require('child_process');
var assert = require('assert');
var async = require('async');
var clc = require('cli-color');

var system = require('../../../utils/system');
var config = require('../../../config');
var devToolsSpecs = require('../../specs');
var mdkLog = require('../../../utils/log');

var checkCocoapodsFolder = require('./cocoapods/checkCocoapodsFolder');
var checkCocoapodsVersion = require('./cocoapods/checkCocoapodsVersion');
var defineEnv = require('../../../platform/ios/gems/defineEnv');

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
                // read configuration to know where cocoapods is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                    if (err || typeof installDir === 'undefined') {
                        cb("Not Installed", toolSpec, installDir);
                    }
                    else {
                        cb(null, toolSpec, installDir);
                    }
                });
            },
            function ( toolSpec, installDir, cb) {
                defineEnv(devToolsSpec, function(err) {
                    cb(err, toolSpec, installDir);
                });
            },
            function ( toolSpec, installDir, cb) {
                // check directory of maven is ok.
                checkCocoapodsFolder( installDir, function(err) {
                    if (err) {
                        cb(err, toolSpec, installDir);
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
                        cb(err, toolSpec, installDir);
                    }
                    else {
                        cb(null, toolSpec, installDir);
                    }
                });
            }
        ], function(err, toolSpec, installDir) {
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
};
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

        var spawn = child_process.spawn('sw_vers', ['-productVersion']);
        var output = '' ;


        spawn.stdout.on('data', function(data) {
            output += data;
        });
        var requiredVersion = checkSpec.opts.minVersion;

        async.waterfall( [
            function (cb) {
                spawn.on('close', function (code) {
                    output = output.toString().split('\n')[0];
                    var macosVersion = output;
                    normalizeMacosVersion(macosVersion, function (normalizedVersion) {
                        if (macosVersion !== false) {
                            if ( semver.gte(normalizedVersion, requiredVersion) ) {
                                cb(null, macosVersion);
                            }
                            else {
                                cb('bad Mac OS version: ' + macosVersion + '. Minimum required version is : ' + requiredVersion);
                            }
                        } else {
                            cb('sw_vers command failed');
                        }
                    });
                });
            }], function(err, currentVersion) {
            if ( err ) {
                var indication =  err;
                indication = indication + '\n';
                indication = indication + clc.red.bold('     You need to install a minimum required version of Mac OS (' + requiredVersion + ').');
                mdkLog.ko("Mac OS", indication);
                callback(false);
            }
            else {
                // all checks passed, don't need to reinstall
                mdkLog.ok("Mac OS", "version: " + currentVersion);
                callback(true);
            }
        });

    }
};

function normalizeMacosVersion(version, callback) {
    if(version.split(".").length === 2) {
        version = version + ".0";
    }
    callback(version);
}
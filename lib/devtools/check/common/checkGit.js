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
var assert = require('assert');
var async = require('async');
var clc = require('cli-color');
var child_process = require('child_process');

var system = require('../../../utils/system');
var config = require('../../../config');
var devToolsSpecs = require('../../specs');

var defineEnv = require('../../../platform/common/jdk/defineEnv');
var checkJavaFolder = require('./java/checkJavaFolder');
var checkJavaVersion = require('./java/checkJavaVersion');
var mdkLog = require('../../../utils/log');

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

        var spawn = child_process.spawn('git', ['--version']);
        var output = '' ;


        spawn.stdout.on('data', function(data) {
            output += data;
        });

        async.waterfall( [
            function (cb) {
                spawn.on('close', function (code) {
                    if (/^git version/.test(output)) {
                        return cb(null);
                    }
                    else {
                        return cb("Git not installed");
                    }
                });
            }], function(err, currentVersion) {
            if ( err ) {
                var indication = clc.red.bold('     You need to install Git and put it in your PATH');
                mdkLog.ko("Git", indication);
                callback(false);
            }
            else {
                // all checks passed, don't need to reinstall
                mdkLog.ok("Git","");
                callback(true);
            }
        });

    }
};
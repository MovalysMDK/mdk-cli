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
'use strict';

var assert = require('assert');
var async = require('async');

var jdk = require('../common/jdk');
var maven = require('../common/maven');
var sdk = require('../android/sdk');

/**
 * Display required shell environment for mdk.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function displayEnv( projectConf, devToolsSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall([
        function(cb) {
            jdk.displayEnv(devToolsSpecs, osName, "win8", cb);
        },
        function(cb) {
            maven.displayEnv(devToolsSpecs, osName, "win8", cb);
        },
        function(cb) {
            sdk.displayEnv(devToolsSpecs, osName, "win8", cb);
        }
    ],
    function(err, results) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = displayEnv;
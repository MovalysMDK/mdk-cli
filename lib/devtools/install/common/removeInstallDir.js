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

var async = require('async');
var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');

var system = require('../../../utils/system');
var devToolsSpecs = require('../../specs');
var osName = require('../../../utils/system/osName');
var config = require('../../../config');

/**
 * Default installation script for dev tools.
 * @param toolSpec toolSpec
 * @param callback callback
 */
function removeInstallDir( toolSpec, callback) {

    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
        },
        function(installDir, cb) {
            if ( typeof installDir !== "undefined" ) {
                fs.remove(installDir, function (err) {
                    cb(err);
                });
            }
            else {
                cb();
            }
        }
    ], function(err) {
        callback(err);
    });
}

module.exports = removeInstallDir;
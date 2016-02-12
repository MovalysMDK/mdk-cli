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
var assert = require('assert');

var findToolSpec = require('./findToolSpec');
var config = require('../../config');

/**
 * Find install directory for a tool
 * @param toolsSpec devtool specification
 * @param toolName tool name
 * @param platform mobile platform
 * @param callback callback
 */
function getToolInstallDir( toolsSpec, toolName, osName, platformName, callback ) {

    assert.equal(typeof toolsSpec, 'object');
    assert.equal(typeof toolName, 'string');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // find tool spec
            findToolSpec(toolsSpec, toolName, osName, platformName, cb);
        },
        function (results, cb) {
            var toolSpec = results[0];
            // read configuration to know where tool is installed.
            config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                if (err || typeof installDir === 'undefined') {
                    cb("Tool '" + toolName + "' is not installed.");
                }
                else {
                    cb(null, installDir);
                }
            });
        }
    ], function(err, installDir ) {
        callback(err, installDir );
    });
}

module.exports = getToolInstallDir;
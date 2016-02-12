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
var removeInstallDir = require('./removeInstallDir');
var config = require('../../../config');
var async = require('async');

var assert = require('assert');
/**
 *
 * @param toolSpec Tool specs of tool to uninstall
 * @param removeDependencies Indicates if dependencies should be removed too
 * @param callback Callback
 */
function uninstallDir(toolSpec, removeDependencies, callback) {

    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof removeDependencies, 'boolean');
    assert.equal(typeof callback, 'function');

    async.waterfall([
        function(cb) {
            // Remove installDir
            removeInstallDir(toolSpec, cb);
        },
        function(cb) {
            // del config
            config.del("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
        }
    ], function(err) {
        callback(err);

    });
}

module.exports = uninstallDir;
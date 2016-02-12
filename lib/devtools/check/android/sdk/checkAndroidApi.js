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

var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
var async = require('async');

/**
 * Check the directory of android-sdk
 * @param androidSdkPath directory where android sdk is installed.
 * @param toolSpec tool specification.
 * @param callback callback
 */
function checkAndroidApi( androidSdkPath, toolSpec, callback ) {

    assert.equal(typeof androidSdkPath, 'string');
    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof callback, 'function');

    var missingApi = [];
    async.eachSeries(toolSpec.opts.api, function(api, cb) {
        var apiSourcePropsFile = path.join(androidSdkPath, "platforms", "android-" + api, "source.properties");
        fs.access(apiSourcePropsFile, fs.F_OK | fs.R_OK, function(err) {
            if ( err) {
                missingApi.push(api);
            }
            cb();
        });
    },
    function done() {
        if ( missingApi.length > 0 ) {
            callback("missing android platfom api: " + missingApi );
        }
        else {
            callback();
        }
    });
}
module.exports = checkAndroidApi;
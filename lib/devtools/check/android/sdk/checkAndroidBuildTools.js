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
 * Check build tools are installed.
 * @param androidSdkPath directory where android sdk is installed.
 * @param toolSpec tool specification
 * @param callback callback
 */
function checkAndroidBuildTools( androidSdkPath, toolSpec, callback ) {

    assert.equal(typeof androidSdkPath, 'string');
    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof callback, 'function');

    var buildToolsVersion = toolSpec.opts.buildTools;
    var buildToolsSourcePropsFile = path.join(androidSdkPath, "build-tools", buildToolsVersion, "source.properties");
    fs.access(buildToolsSourcePropsFile, fs.F_OK | fs.R_OK, function(err) {
        if ( err) {
            callback("missing android build tools: " + buildToolsVersion);
        }
        else {
            callback();
        }
    });
}
module.exports = checkAndroidBuildTools;
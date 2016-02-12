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
var system = require('../../../../utils/system');
var mdkpath = require('../../../../mdkpath');

/**
 * Check the directory of gradle.
 * @param installDir directory where gradle is installed.
 * @param callback callback
 */
function checkGradleFolder( installDir, callback ) {

    assert.equal(typeof installDir, 'string');
    assert.equal(typeof callback, 'function');

    var gradleProperties = path.join(mdkpath().confDir, "gradle-template.properties");

    // check directory is present
    fs.access(installDir, fs.F_OK | fs.R_OK, function(err) {
        if ( err ) {
            callback("directory does not exists: " + installDir + ". err:" + err );
        }
        else {
            // check file gradle-template.properties exists.
            fs.access(gradleProperties, fs.F_OK | fs.R_OK, function(err) {
                if ( err ) {
                    callback("file does not exist:" + gradleProperties + ". Err:" + err);
                }
                else callback();
            });
        }
    });
}
module.exports = checkGradleFolder;
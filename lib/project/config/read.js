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
var assert = require('assert');

var readUserConf = require('./readUserConf');
var mergeConf = require('./mergeConf');

/**
 * Read project configuration at project level.
 * <p>Following configuration files are merged :</p>
 * <ul>
 *     <li>mdk-project.json from npm-cli installation.</li>
 *     <li>mdk-project.json from ~/.mdk/mdk-project.json</li>
 *     <li>mdk-project.json from project directory.</li>
 * </ul>
 * @param callback
 *
 */
function read(callback) {

    assert.equal(typeof callback, 'function');

    // Read configuration at user level.
    readUserConf( function(err, userConf) {

        if ( err ) {
            callback(err);
        }
        else {
            var projectConfigFile = 'mdk-project.json';

            fs.access(projectConfigFile, fs.R_OK, function(err) {

                if ( err ) {
                    callback('Current directory is not a mdk project: mdk-project.json not found');
                }
                else {
                    fs.readJson(projectConfigFile, function (err, projectConf) {
                        callback(null, mergeConf(userConf, projectConf));
                    });
                }
            });
        }
    });
}

module.exports = read;
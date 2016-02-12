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
var path = require('path');

var system = require('../../utils/system');
var mergeConf = require('./mergeConf');
var mdkpath = require('../../mdkpath');

/**
 * Read project configuration at user level.
 * <p>Following configuration files are merged :</p>
 * <ul>
 *     <li>mdk-project.json from npm-cli installation.</li>
 *     <li>mdk-project.json from ~/.mdk/mdk-project.json</li>
 * </ul>
 * @param callback
 */
function readUserConf(callback) {

    assert.equal(typeof callback, 'function');

    var defaultConfFile = path.join(__dirname, '..', 'mdk-project.json');
    var userConfFile = path.join( mdkpath().homeDir, "mdk-project.json");

    fs.readJson(defaultConfFile, function(err, defaultConf) {
        if ( err) {
            // default configuration must exist.
            callback(err);
        }
        else {
            fs.access(userConfFile, fs.R_OK, function(err) {
                if ( err ) {
                    callback(null, defaultConf );
                }
                else {
                    fs.readJson(userConfFile, function(err, userConf) {
                        if ( err ) {
                            callback(err);
                        }
                        else {
                            callback(null, mergeConf( defaultConf, userConf ));
                        }
                    });
                }
            });
        }
    });
}

module.exports = readUserConf;
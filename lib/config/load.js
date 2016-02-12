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

var system = require('../utils/system');
var mdkpath = require('../mdkpath');

var fs = require('fs-extra');
var assert = require('assert');
var path = require('path');


/**
 * Loads the configuration from global and user stores.
 * @param readonly A boolean that indicates if the user story must be
 * loaded in read-only mode
 * @param options Some options
 * @param callback Callback
 */
function load(readonly, options, callback) {

    //Check parameters
    assert.equal(typeof readonly, 'boolean');
    assert.equal(typeof callback, 'function');
    assert.equal(typeof options, 'object');

    //Build configurations files paths
    var globalConfFile = path.join(__dirname, '..', 'mdk-cli.json');
    var userConfDirectory = mdkpath().confDir;
    var userConfFile = path.join(userConfDirectory, 'mdk-cli.json');

    //If the directory doesn't exist, create it
    fs.ensureDir(userConfDirectory, function (err) {
        if (err) {
            callback(err);
        }
        else {
            var nconf = require('nconf');
            nconf.add('user', {type: 'file', readonly:readonly, file: userConfFile});
            if(!options.save) {
                nconf.add('global', {type: 'file', readOnly: true, file: globalConfFile});
            }


            callback(null, nconf);
        }
    });
}

module.exports = load;
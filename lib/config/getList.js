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
var path = require('path');
var assert = require('assert');
var async = require('async');

var load = require('./load');
var system = require('../utils/system');

/**
 * Get the values of each keys of the array
 * @param keys The key of a configuration value
 * @param callback Callback
 */
function getList(keys, callback) {

    //Check parameters
    assert.equal(typeof keys, 'object');
    assert.equal(typeof callback, 'function');

    //Load configurations

    var loadOptions = {"save": false};
    load( true, loadOptions, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            getListValue(keys, nconf, callback);
        }
    });
}

function getListValue(keys, nconf, callback) {

    var results = {};

    async.eachSeries(keys, function(key, cb) {

        var value = nconf.get(key);
        results[key] = value;
        cb();

    }, function() {
        callback(null, results);
    });
}

module.exports = getList;
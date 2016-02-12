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

var load = require('./load');
var assert = require('assert');

/**
 * Delete a key/value pair from user configuration store
 * @param key The key to delete
 * @param callback Callback
 */
function del(key, callback) {

    //Check parameters
    assert.equal(typeof key, 'string');
    assert.equal(typeof callback, 'function');

    //Load configuration
    var loadOptions = {"save": true};
    load( false, loadOptions, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            nconf.clear(key);
            nconf.save(function(err) {
                callback(err);
            });
        }
    });
}


module.exports = del;
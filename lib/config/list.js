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
 * List all configuration values from global and configurations stores.
 * @description If a key both exists in user and global stores, the value
 * associated to the key in the user store only will be shown.
 * @param callback Callback
 */
function list(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    //Load configurations
    var loadOptions = {"save": false};
    load( true, loadOptions, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            var list = nconf.get();
            callback(null, list);
        }
    });

}

module.exports = list;
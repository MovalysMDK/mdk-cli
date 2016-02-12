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

var get = require('./get');

/**
 * Log a parameter value to the console.
 * <p>Password are hidden.</p>
 * @param key key
 * @param value value
 * @param onlyValue don't display key name
 */
function logParam(key, value, onlyValue) {

    //Check parameters
    assert.equal(typeof key, 'string');
    assert.equal(typeof onlyValue, 'boolean');

    var displayedValue = value;
    if ( key === 'mdk_password') {
        displayedValue = '*********'; // hide password
    }

    if ( onlyValue ) {
        console.log(displayedValue);
    }
    else {
        console.log(key + ": " + displayedValue);
    }
}


module.exports = logParam;
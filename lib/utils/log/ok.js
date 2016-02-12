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

var clc = require('cli-color');
var assert = require('assert');

/**
 * Log a OK statement
 * @param title The title of the statement
 * @param title The message of the statement
 */
function ok(title, message) {

    //Check Parameters
    assert(typeof title, "string");
    assert(typeof message, "string");

    console.log(clc.green.bold('[OK] ') + clc.bold(title) + " - " + message);
}




module.exports = ok;
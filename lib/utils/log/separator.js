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

/**
 * Log a separator
 * @param char Char used to draw the separator
 * @param length Separator length
 */
function separator(char, length) {

    var sChar = '-';
    var sLength = 70;

    if(typeof char != 'undefined' && char.length === 1) {
        sChar = char;
    }
    if(typeof length != 'undefined' && length > 0 && length <= 120) {
        sLength = length;
    }

    var sSeparator = '';
    for(var i = 0 ; i < sLength ; i++) {
        sSeparator = sSeparator + sChar;
    }

    console.log(sSeparator);
}

module.exports = separator;
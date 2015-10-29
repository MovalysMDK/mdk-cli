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
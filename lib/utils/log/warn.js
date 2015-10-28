"use strict";

var clc = require('cli-color');

/**
 * Log a OK statement
 * @param title The title of the statement
 * @param title The message of the statement
 */
function warn(title, message) {
    console.log(clc.yellow.bold('[WN] ') + clc.bold(title) + " - " + message);
}

module.exports = warn;
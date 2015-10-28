"use strict";

var clc = require('cli-color');

/**
 * Log a OK statement
 * @param title The title of the statement
 * @param title The message of the statement
 */
function ok(title, message) {
    console.log(clc.green.bold('[OK] ') + clc.bold(title) + " - " + message);
}




module.exports = ok;
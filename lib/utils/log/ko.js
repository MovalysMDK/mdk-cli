"use strict";

var clc = require('cli-color');

/**
 * Log a OK statement
 * @param title The title of the statement
 * @param title The message of the statement
 */
function ko(title, message) {
    console.log(clc.red.bold('[KO] ') + clc.bold(title) + " - " + message);
}

module.exports = ko;
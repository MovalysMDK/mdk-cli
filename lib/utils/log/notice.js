"use strict";

var clc = require('cli-color');
var assert = require('assert');


/**
 * Log a notice statement
 * @param titleOrMessage The title if 2 params are defined, message otherwhise
 * @param message The message of the notice
 */
function notice(titleOrMessage, message) {

    assert(typeof titleOrMessage, "string");
    //Message is optional

    if(typeof message != "undefined" && message.length > 0) {
        console.log(clc.bold.italic.yellow('[Notice] ') + clc.bold(titleOrMessage));
        console.log(clc.bold.italic.yellow('[Notice] ') + message);
    }
    else {
        console.log(clc.bold.italic.yellow('[Notice] ') + titleOrMessage);
    }

}

module.exports = notice;
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
    assert.equal(typeof value, 'string');
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
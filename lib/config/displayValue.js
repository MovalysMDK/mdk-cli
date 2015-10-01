"use strict";

var load = require('./load');
var assert = require('assert');

var get = require('./get');
var logParam = require('./logParam');

/**
 * Display value of parameters
 * @param key key
 * @param callback Callback
 */
function displayValue(key, callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    get(key, function(err, value) {
        if ( err ) {
            callback(err);
        }
        else {
            logParam( key, value, true);
            callback();
        }
    });
}


module.exports = displayValue;
"use strict";

var load = require('./load');
var assert = require('assert');

var list = require('./list');
var logParam = require('./logParam');

/**
 * Display all parameters
 * @param callback Callback
 */
function displayAll(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    list(function(err, list) {
        if ( err ) {
            callback(err);
        }
        else {
            for(var key in list) {
                logParam( key, list[key], false);
            }
            callback();
        }
    });
}


module.exports = displayAll;
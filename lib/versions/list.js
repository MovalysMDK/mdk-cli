"use strict"

var load = require('./load');
var assert = require('assert');

/**
 * Return all versions of mdk.
 * @param callback
 */
function list(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    //Load versions
    load(false, function(err, versions) {
        if (err ) {
            callback(err);
        }
        else {
           callback(null, versions);
        }
    });
}

module.exports = list;
"use strict";

var assert = require('assert');
var semver = require('semver');

var load = require('./load');


/**
 * Return the list of templates
 * @param forceUpdate Indicates if an update must be forced
 * @param callback
 */
function get(forceUpdate, callback) {

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');

    load(forceUpdate, function(err, templates) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, templates);
        }
    });
}

module.exports = get;

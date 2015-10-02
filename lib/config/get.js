"use strict";

var fs = require('fs-extra');
var path = require('path');
var assert = require('assert');

var load = require('./load');
var system = require('../utils/system');
var getList = require('./getList');

/**
 * Get a the configuration value associated to the given key
 * @param key The key of a configuration value
 * @param callback Callback
 */
function get(key, callback) {

    //Check parameters
    assert.equal(typeof key, 'string');
    assert.equal(typeof callback, 'function');

    getList([key], function (err, results) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, results[key]);
        }
    });
}






module.exports = get;
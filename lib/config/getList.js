"use strict";

var fs = require('fs-extra');
var path = require('path');
var assert = require('assert');
var async = require('async');

var load = require('./load');
var system = require('../utils/system');

/**
 * Get the values of each keys of the array
 * @param keys The key of a configuration value
 * @param callback Callback
 */
function getList(keys, callback) {

    //Check parameters
    assert.equal(typeof keys, 'object');
    assert.equal(typeof callback, 'function');

    //Load configurations

    var loadOptions = {"save": false};
    load( true, loadOptions, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            getListValue(keys, nconf, callback);
        }
    });
}

function getListValue(keys, nconf, callback) {

    var results = {};

    async.eachSeries(keys, function(key, cb) {

        var value = nconf.get(key);
        results[key] = value;
        cb();

    }, function() {
        callback(null, results);
    });
}

module.exports = getList;
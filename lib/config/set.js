"use strict";

var load = require('./load');
var assert = require('assert');
var fs = require('fs-extra');

/**
 * Set a key/value pair configuration in the user store
 * @param key The key of the configuration to set
 * @param value The value fot he configuration to set
 * @param callback Callback
 */
function set(key, value, callback) {


    //Check parameters
    assert.equal(typeof key, 'string');
    assert.equal(typeof value, 'string');
    assert.equal(typeof callback, 'function');

    //Load configurations
    var loadOptions = {"save": true};
    load( false, loadOptions, function(err, nconf) {
        if (err ) {
            callback(err);
        }
        else {

            nconf.set(key, value);
            nconf.save(function(err) {
                fs.chmodSync(nconf.stores.user.file, '700');
                callback(err);
            });
        }
    });
}

module.exports = set;
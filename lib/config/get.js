"use strict"

var load = require('./load');
var assert = require('assert');

/**
 * Get a the configuration value associated to the given key
 * @param key The key of a configuration value
 * @param callback Callback
 */
function get(key, callback) {

    //Check parameters
    assert.equal(typeof key, 'string');
    assert.equal(typeof callback, 'function');

    //Load configurations
    load( true, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            var value = nconf.get(key);
            if ( !value ) {
                callback("No value for key: " + key );
            }
            else {
                callback(null, value);
            }
        }
    });
}

module.exports = get;
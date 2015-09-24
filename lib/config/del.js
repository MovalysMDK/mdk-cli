"use strict"

var load = require('./load');
var assert = require('assert');

/**
 * Delete a key/value pair from user configuration store
 * @param key The key to delete
 * @param callback Callback
 */
function del(key, callback) {

    //Check parameters
    assert.equal(typeof key, 'string');
    assert.equal(typeof callback, 'function');

    //Load configuration
    load( false, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            nconf.clear(key);
            nconf.save(function(err) {
                callback(err);
            });
        }
    });
}


module.exports = del;
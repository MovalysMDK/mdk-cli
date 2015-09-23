"use strict"

var load = require('./load');

/**
 * Delete a key/value pair from user configuration store
 * @param key The key to delete
 * @param callback Callback
 */
function del(key, callback) {

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
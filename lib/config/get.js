"use strict"

var load = require('./load');

/**
 * Get a the configuration value associated to the given key
 * @param key The key of a configuration value
 * @param callback Callback
 */
function get(key, callback) {

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
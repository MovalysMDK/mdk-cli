"use strict"

var load = require('./load');

/**
 * Set a key/value pair configuration in the user store
 * @param key The key of the configuration to set
 * @param value The value fot he configuration to set
 * @param callback Callback
 */
function set(key, value, callback) {

    load( false, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {

            nconf.set(key, value);
            nconf.save(function(err) {
               callback(err);
            });
        }
    });
}

module.exports = set;
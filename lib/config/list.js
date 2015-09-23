"use strict"

var load = require('./load');

/**
 * List all configuration values from global and configurations stores.
 * @description If a key both exists in user and global stores, the value
 * associated to the key in the user store only will be shown.
 * @param callback Callback
 */
function list(callback) {

    load( true, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            var list = nconf.get();
            callback(list, null);
        }
    });

}

module.exports = list;
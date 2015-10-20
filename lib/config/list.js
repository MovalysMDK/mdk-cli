"use strict";

var load = require('./load');
var assert = require('assert');

/**
 * List all configuration values from global and configurations stores.
 * @description If a key both exists in user and global stores, the value
 * associated to the key in the user store only will be shown.
 * @param callback Callback
 */
function list(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    //Load configurations
    var loadOptions = {"save": false};
    load( true, loadOptions, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            var list = nconf.get();
            callback(null, list);
        }
    });

}

module.exports = list;
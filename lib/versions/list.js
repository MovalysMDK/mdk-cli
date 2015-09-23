"use strict"

var load = require('./load');


/**
 * Return all versions of mdk.
 * @param callback
 */
function list(callback) {

    load(false, function(err, versions) {
        if (err ) {
            callback(err);
        }
        else {
           callback(null, versions);
        }
    });
}

module.exports = list;
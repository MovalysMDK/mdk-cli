"use strict";

var load = require('./load');
var assert = require('assert');

/**
 * Return the last version of mdk
 * @param callback
 */
function lastVersion(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    //Load versions
    load(false, function(err, versions) {
        if (err ) {
            callback(err);
        }
        else {
            callback(null, versions.versions[0].version);
        }
    });
}

module.exports = lastVersion;
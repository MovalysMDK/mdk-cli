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
        if (err) {
            callback(err);
        }
        else {
            versions.versions.forEach(function (item) {
                    if (item.version.indexOf("-SNAPSHOT") === -1) {
                        callback(null, item.version);
                    }
                }
            );
            callback("No version found");

        }
    });
}


module.exports = lastVersion;
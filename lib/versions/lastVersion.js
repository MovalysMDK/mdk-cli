"use strict"

var load = require('./load');

/**
 * Return the last version of mdk
 * @param callback
 */
function lastVersion(callback) {
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
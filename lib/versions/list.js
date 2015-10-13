"use strict";

var load = require('./load');
var assert = require('assert');

/**
 * Return all versions of mdk.
 * @param callback
 */
function list(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    //Load versions
    load(false, function(err, versions) {
        console.log(versions);
        var versionsWithoutSnapshots = versions;
        versions.versions.forEach(function (item) {
                if (item.version.indexOf("-SNAPSHOT") === -1) {
                    var indexOfObjectToDelete = versionsWithoutSnapshots.versions.indexOf(item) - 1;
                    versionsWithoutSnapshots.versions.splice(indexOfObjectToDelete, 1);
                }
            }
        );
        console.log(versionsWithoutSnapshots);
        if (err ) {
            callback(err);
        }
        else {
           callback(null, versionsWithoutSnapshots);
        }
    });
}

module.exports = list;
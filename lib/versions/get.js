"use strict"

var load = require('./load');
var assert = require('assert');


/**
 * Return version info of mdk
 * @param forceUpdate Indicates if an update must be forced
 * @param versionToGet mdk version to get
 * @param callback
 */
function get(forceUpdate, versionToGet, callback) {

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof versionToGet, 'string');
    assert.equal(typeof callback, 'function');

    //Load versions
    load(forceUpdate, function(err, versions) {
        if (err) {
            callback(err);
        }
        else {
            retrieveVersion(versionToGet, versions, callback);
        }
    });

}

/**
 * Retrieve a specific version of MDK
 * @param version The version to retrieve
 * @param allVersions All version found from mdkversions files
 * @param callback Callback
 */
function retrieveVersion(version, allVersions, callback) {

    //Check parameters
    assert.equal(typeof version, 'string');
    assert.equal(typeof allVersions, 'object');
    assert.equal(typeof callback, 'function');

    //Retrieve specific version
    var foundItem;
    allVersions.versions.forEach(function(item) {
        if(item.version === version) {
            foundItem = item;
        }
    });
    if(foundItem) {
        callback(null, foundItem);
    }
    else {
        callback("MDK version with name '" + version + "' not found");
    }
}

module.exports = get;

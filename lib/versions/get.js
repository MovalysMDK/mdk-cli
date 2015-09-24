"use strict"

var load = require('./load');


/**
 * Return version info of mdk
 * @param forceUpdate Indicates if an update must be forced
 * @param versionToGet mdk version to get
 * @param callback
 */
function get(forceUpdate, versionToGet, callback) {

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

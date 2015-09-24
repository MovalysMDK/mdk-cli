"use strict"

var load = require('./load');


/**
 * Return version info of mdk
 * @param version mdk version version
 * @param callback
 */
function get(version, callback) {

    load(false, function(err, versions) {
        if (err) {
            callback(err);
        }
        else {
            retrieveVersion(version, versions, callback);
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
    allVersions.versions.forEach(function(item) {
        if(item.version === version) {
            callback(null, item);
        }
    });
    callback("MDK version with name '" + version + "' not found");
}

module.exports = get;

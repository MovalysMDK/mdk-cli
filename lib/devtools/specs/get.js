"use strict"

var config = require('../../config');
var versions = require('../../versions');
var network = require('../../utils/network');
var system = require('../../utils/system');
var fs = require('fs');

/**
 * Return installation specification for devtool version.
 * @param mdkVersion mdk version
 * @param forceUpdate force download of specification, even if file exists in cache
 * @param callback
 */
function get(mdkVersion, forceUpdate, callback) {

    // retrieve version info
    versions.get(mdkVersion, forceUpdate, function(err, versionInfo) {
        if (err) {
            callback(err);
        }
        else {
            retrieveDevToolSpec( versionInfo.devToolsVersion, forceUpdate, function( err) {
                if ( err) {
                    callback(err);
                }
                else {
                    loadVersion(versionInfo.devToolsVersion, callback);
                }
            });
        }
    });
}

/**
 * Load devtools-VERSION.json file from location :
 * <ul>
 *     <li>~/.mdk/cache/devtools/devtools-VERSION.json</li>
 * </ul>
 * @param devToolsVersion devtool version.
 * @param callback callback
 */
function loadVersion(devToolsVersion, callback ) {

    //TODO: use ~/.mdk/cache/devtools/devtools-VERSION.json

    //return json in callback
    callback(null, JSON.parse("{}"));
}

/**
 * Retrieve devtools-version.json from mdk website.
 * <p>Update is run if no mdkdevtools-version.json in cache or forceUpdate is true.</p>
 * @param devToolsVersion devtools version.
 * @param forceUpdate force download from mdk website.
 * @param callback callback
 */
function retrieveDevToolSpec( devToolsVersion, forceUpdate, callback ) {

    var fileName = "devtools-" + devToolsVersion + ".json";
    var cacheDevtoolVersionFile = system.userHome() + "/.mdk/cache/devtools/" + fileName;

    fs.access(cacheDevtoolVersionFile, fs.R_OK, function(err) {

        if ( err || forceUpdate ) {

            config.get('mdkUrl', function(err, baseUrl) {

                if (err) {
                    callback(err);
                }
                else {

                    var options = {};
                    options.url = baseUrl + "/devtools/" + fileName;
                    network.downloadFile(options, cacheDevtoolVersionFile, callback);
                }
            });
        }
        else {
            callback();
        }
    });
}

module.exports = get;
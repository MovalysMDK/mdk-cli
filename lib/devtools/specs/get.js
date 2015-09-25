"use strict"

var config = require('../../config');
var versions = require('../../versions');
var network = require('../../utils/network');
var system = require('../../utils/system');

var fs = require('fs-extra');
var path = require('path');

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

    var fileName = "devtools-" + devToolsVersion + ".json";
    var cacheDevToolDir = path.join(system.userHome(), ".mdk", "cache", "devtools");

    var cacheDevtoolVersionFile =  path.join(cacheDevToolDir, fileName);
    var productDevtoolVersionFile = path.join(__dirname, '..', fileName);

    //Create fs-extra.readJSON fixed callback, to add devVersionTools
    //to the result.
    var readJsonCallback = function (err, result) {
        if(!err) {
            result.version = devToolsVersion;
            callback(null, result);
        }
        else {
            callback(err);
        }
    }

    //First try to retrieve product file devtool version
    //Otherwhise try to retrieve cache version file
    fs.access(productDevtoolVersionFile, function(productErr) {
        if(productErr) {
            fs.access(cacheDevtoolVersionFile, function(cacheErr) {
                if(cacheErr) {
                    callback('No devtools version file found for devtools version ' + devToolsVersion);
                }
                else {
                    fs.readJson(cacheDevtoolVersionFile, readJsonCallback);
                }
            });
        }
        else {
            fs.readJson(productDevtoolVersionFile, readJsonCallback);
        }
    })
}

/**
 * Retrieve devtools-version.json from mdk website.
 * <p>Update is run if no mdkdevtools-version.json in cache or forceUpdate is true.</p>
 * @param devToolsVersion devtools version.
 * @param forceUpdate force download from mdk website.
 * @param callback callback
 */
function retrieveDevToolSpec( devToolsVersion, forceUpdate, callback ) {

    //Compute product-local and cache devtools version files paths
    var fileName = "devtools-" + devToolsVersion + ".json";
    var cacheDevToolDir = path.join(system.userHome(), ".mdk", "cache", "devtools");

    var cacheDevtoolVersionFile =  path.join(cacheDevToolDir, fileName);

    //Try to access to product file, cache file otherwise.
    fs.access(productDevtoolVersionFile, function (productErr) {

        if(productErr) {
            fs.ensureDir(cacheDevToolDir, function(cacheErr) {
                if ( cacheErr) {
                    callback(cacheErr);
                }
                else {
                    fs.access(cacheDevtoolVersionFile, fs.R_OK, function(cacheErr2) {
                        if ( cacheErr2 || forceUpdate ) {
                            loadFileFromNetwork(fileName, callback);
                        }
                        else {
                            callback();
                        }
                    });
                }
            });
        }
        else {
            callback();
        }
    });
}

/**
 * Loads the file with the given name from network
 * @param fileName The file name to load
 * @param callback The callback
 */
function loadFileFromNetwork (fileName, callback) {
    config.get('mdkUrl', function(configErr, baseUrl) {
        if (configErr) {
            callback(configErr);
        }
        else {
            var options = {};
            options.url = baseUrl + "/devtools/" + fileName;
            network.downloadFile(options, cacheDevtoolVersionFile, callback);
        }
    });
}
module.exports = get;
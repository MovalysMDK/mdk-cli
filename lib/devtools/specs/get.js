"use strict"

var config = require('../config');
var network = require('../utils/network');
var system = require('../utils/system');

/**
 * Return installation specification for devtool version.
 * @param version devtoolversion
 * @param forceUpdate force download of specification, even if file exists in cache
 * @param callback
 */
function get(version, forceUpdate, callback) {

    retrieveDevToolVersion( forceUpdate, function(err) {
        if ( err) {
            // don't fail on retrieving versions
            //TODO: show warning, use clc
        }

        loadVersion(version, callback);
    });
}

/**
 * Load mdkdevtools-VERSION.json file from location :
 * <ul>
 *     <li>~/.mdk/cache/devtools/mdkdevtools-VERSION.json</li>
 * </ul>
 * @param version devtool version.
 * @param callback callback
 */
function loadVersion(version, callback ) {

    //TODO: use ~/.mdk/cache/devtools/mdkdevtools-VERSION.json
}

/**
 * Retrieve mdkversions.json from mdk website.
 * Update is run if no mdkversions.json in cache or forceUpdate is true.
 * @param forceUpdate force download from mdk website.
 * @param callback callback
 */
function retrieveDevToolVersion( version, forceUpdate, callback ) {

    var fileName = "mdkdevtools-" + version + "json";
    var cacheDevtoolVersion = system.userHome() + "/.mdk/cache/devtools/" + fileName;

    fs.exists(cacheDevtoolVersion, function(exists) {

        if ( !exists || forceUpdate ) {
            var options = {};
            options.url = config.get('mdkUrl') + '/' + fileName;
            network.downloadFile(options, '~/.mdk/cache/devtools/' + fileName, callback);
        }
        else {
            callback();
        }
    });
}

module.exports = get;
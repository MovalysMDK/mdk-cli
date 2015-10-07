"use strict";

var fs = require('fs-extra');
var assert = require('assert');
var path = require('path');
var clc = require('cli-color');

var config = require('../config');
var network = require('../utils/network');
var system = require('../utils/system');

/**
 * Load versions of mdk.
 * <p>A version has the following structure:</p>
 * <code>{
		version: 5.0.1,
		messages: [
			{ text: "",
			  level: "" }
	    ],
		devToolsVersion: 2.0.0
	}</code>
 * @param forceUpdate force checking for a new mdkversions file on mdk website.
 * @param callback
 */
function load(forceUpdate, callback) {

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');

    //Retrieve last versions then load versions
    retrieveLastVersions( forceUpdate, function(err) {

        if ( err) {
            // don't fail on retrieving versions
            clc.yellow('[WARN] Update of mdkversions.json failed: ' + err);
        }
        loadVersions(callback);
    });
}

/**
 * Retrieve mdkversions.json from mdk website.
 * Update is run if no mdkversions.json in cache or forceUpdate is true.
 * @param forceUpdate force download from mdk website.
 * @param callback callback
 */
function retrieveLastVersions( forceUpdate, callback ) {

    var cacheDir = path.join(system.userHome(), ".mdk", "cache");

    fs.ensureDir(cacheDir, function(err) {
        if ( err ) {
            callback(err);
        }
        else {
            var cacheMdkVersions = path.join( cacheDir, "mdkversions.json");
            fs.access(cacheMdkVersions, fs.R_OK, function(err) {

                checkProductVersion(cacheMdkVersions, function(err) {
                    if(err) {
                        console.log(clc.yellow("[WARN] : Unable to retrieve last MDK Versions from product"));
                    }
                    else {
                        var needRefresh = false;
                        if ( !err) {
                            // if mdkversions.json is older than one day, an update will be performed.
                            needRefresh = lastModified(cacheMdkVersions) > 1000 * 60 * 60 * 24;
                        }

                        if ( err || forceUpdate || needRefresh ) {
                            var options = {};

                            config.get('mdkUrl', function(err,value) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    options.url = value + '/mdkversions.json';
                                    network.downloadFile(options, cacheMdkVersions, function(err) {
                                        if (err) {
                                            callback(err);
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

                    }
                });
            });
        }
    });
}

/**
 * Check the product version od mdkversion.json and copy it
 * to cache folder if it's more recent
 * @param cacheMdkVersions The path of cached file
 * @param callback Callback
 */
function checkProductVersion (cacheMdkVersions, callback) {
    var productVersion = path.join(__dirname, 'mdkversions.json')
    if(lastModified(productVersion) < lastModified(cacheMdkVersions)) {
        fs.copy(productVersion, cacheMdkVersions, { clobber: true }, callback);
    }
    else {
        callback();
    }
}

/**
 * Load mdkversions.json file from following locations :
 * <ul>
 *     <li>~/.mdk/cache/mdkversions.json</li>
 *     <li>mdk-cli installation directory</li>
 * </ul>
 * @param callback callback
 */
function loadVersions( callback ) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    //Load versions
    var cacheMdkVersions = path.join(system.userHome(), '.mdk', 'cache', 'mdkversions.json');
    var defaultMdkVersions = path.join(__dirname, 'mdkversions.json');


    fs.access(cacheMdkVersions,fs.R_OK, function(err) {
        if ( err ) {
            fs.readJson(defaultMdkVersions, callback);
        }
        else {
            fs.readJson(cacheMdkVersions, callback);
        }
    });
}

/**
 * Return duration in milliseconds since file was modified.
 * @param file file
 */
function lastModified(file) {

    var stats = fs.statSync(file);
    var date1 = stats.mtime.getTime();
    var date2 = new Date().getTime();
    return date2 - date1;
}

module.exports = load;
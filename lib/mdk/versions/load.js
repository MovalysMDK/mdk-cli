"use strict";

var fs = require('fs-extra');
var assert = require('assert');
var path = require('path');
var async = require('async');
var clc = require('cli-color');

var io = require('../../utils/io/index');
var config = require('../../config/index');
var network = require('../../utils/network/index');
var system = require('../../utils/system/index');
var mdkpath = require('../../mdkpath');

/**
 * Load mdk of mdk.
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

    //Retrieve last mdk then load mdk
    retrieveLastVersions( forceUpdate, function(err) {

        if ( err) {
            // don't fail on retrieving mdk
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

    var mdkPaths = mdkpath();
    var cacheMdkVersionsFile = path.join( mdkPaths.cacheDir, "mdkversions.json");
    var options = {};

    async.waterfall([
        function(cb) {
            // create cache dir if it does not exists.
            fs.ensureDir(mdkPaths.cacheDir, function(err) {
                cb(err);
            });
        },
        function(cb) {
            checkCachedVersion(cacheMdkVersionsFile,cb);
        },
        function(inCache, cb) {
            // if mdkversions.json is older than one day, an update will be performed.
            var needRefresh = !inCache || io.timeSinceLastModification(cacheMdkVersionsFile) > 1000 * 60 * 60 * 24;
            cb(null, forceUpdate || needRefresh);
        },
        function( doDownload, cb) {
            if ( doDownload ) {
                // get url from configuration
                config.get('mdkUrl', function (err, baseUrl) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        // download mdkversions.json
                        options.url = baseUrl + '/mdkversions.json';
                        network.downloadFile(options, cacheMdkVersionsFile, false, function (err) {
                            if (err) {
                                cb(err);
                            }
                            else {
                                cb();
                            }
                        });
                    }
                });
            }
            else {
                cb();
            }
        }

    ], function(err) {
        callback(err);
    });
}

/**
 * Check if mdkversions is valid.
 * <ul>
 *     <li>the file exists</li>
 *     <li>file is newer than the one in the product directory.</li>
 * </ul>
 * If file exists and not valid, the file is removed from cache.
 * @param cacheMdkVersionsFile The path of cached file
 * @param callback Callback
 */
function checkCachedVersion(cacheMdkVersionsFile, callback) {

    assert.equal(typeof cacheMdkVersionsFile, 'string');
    assert.equal(typeof callback, 'function');

    // test if mdkversions.conf is in cache.
    fs.access(cacheMdkVersionsFile, fs.R_OK, function(err) {
        if (err) {
            callback(null, false);
        }
        else {
            var productMdkVersionsFile = path.join(__dirname, 'mdkversions.json');
            if(io.compareLastModificationDate(productMdkVersionsFile, cacheMdkVersionsFile ) > 0 ) {
                // delete cached version.
                fs.remove(cacheMdkVersionsFile, function(err) {
                    callback(err, false);
                });
            }
            else {
                callback(null, true);
            }
        }
    });
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

    //Load mdk
    var cacheMdkVersionsFile = path.join(mdkpath().cacheDir, 'mdkversions.json');
    var defaultMdkVersionsFile = path.join(__dirname, 'mdkversions.json');

    fs.access(cacheMdkVersionsFile,fs.R_OK, function(err) {
        if ( err ) {
            fs.readJson(defaultMdkVersionsFile, callback);
        }
        else {
            fs.readJson(cacheMdkVersionsFile, callback);
        }
    });
}


module.exports = load;
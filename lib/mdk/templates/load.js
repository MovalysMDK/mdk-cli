"use strict";

var fs = require('fs-extra');
var assert = require('assert');
var path = require('path');
var async = require('async');
var clc = require('cli-color');

var io = require('../utils/io');
var config = require('../config');
var network = require('../utils/network');
var system = require('../utils/system');
var mdkpath = require('../mdkpath');

/**
 * Load templates of mdk.
 * <p>A version has the following structure:</p>
 * <code>{
		version: 5.0.1,
		messages: [
			{ text: "",
			  level: "" }
	    ],
		devToolsVersion: 2.0.0
	}</code>
 * @param forceUpdate force checking for a new mdktemplates file on mdk website.
 * @param callback
 */
function load(forceUpdate, callback) {

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');

    //Retrieve last templates then load templates
    retrieveLastTemplates( forceUpdate, function(err) {

        if ( err) {
            // don't fail on retrieving templates
            clc.yellow('[WARN] Update of mdktemplates.json failed: ' + err);
        }
        loadTemplates(callback);
    });
}

/**
 * Retrieve mdktemplates.json from mdk website.
 * Update is run if no mdktemplates.json in cache or forceUpdate is true.
 * @param forceUpdate force download from mdk website.
 * @param callback callback
 */
function retrieveLastTemplates( forceUpdate, callback ) {

    var mdkPaths = mdkpath();
    var cachemdktemplatesFile = path.join( mdkPaths.cacheDir, "mdktemplates.json");
    var options = {};

    async.waterfall([
        function(cb) {
            // create cache dir if it does not exists.
            fs.ensureDir(mdkPaths.cacheDir, function(err) {
                cb(err);
            });
        },
        function(cb) {
            checkCachedVersion(cachemdktemplatesFile,cb);
        },
        function(inCache, cb) {
            // if mdktemplates.json is older than one day, an update will be performed.
            var needRefresh = !inCache || io.timeSinceLastModification(cachemdktemplatesFile) > 1000 * 60 * 60 * 24;
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
                        // download mdktemplates.json
                        options.url = baseUrl + '/mdktemplates.json';
                        network.downloadFile(options, cachemdktemplatesFile, false, function (err) {
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
 * Check if mdktemplates is valid.
 * <ul>
 *     <li>the file exists</li>
 *     <li>file is newer than the one in the product directory.</li>
 * </ul>
 * If file exists and not valid, the file is removed from cache.
 * @param cachemdktemplatesFile The path of cached file
 * @param callback Callback
 */
function checkCachedVersion(cachemdktemplatesFile, callback) {

    assert.equal(typeof cachemdktemplatesFile, 'string');
    assert.equal(typeof callback, 'function');

    // test if mdktemplates.conf is in cache.
    fs.access(cachemdktemplatesFile, fs.R_OK, function(err) {
        if (err) {
            callback(null, false);
        }
        else {
            var productmdktemplatesFile = path.join(__dirname, 'mdktemplates.json');
            if(io.compareLastModificationDate(productmdktemplatesFile, cachemdktemplatesFile ) > 0 ) {
                // delete cached version.
                fs.remove(cachemdktemplatesFile, function(err) {
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
 * Load mdktemplates.json file from following locations :
 * <ul>
 *     <li>~/.mdk/cache/mdktemplates.json</li>
 *     <li>mdk-cli installation directory</li>
 * </ul>
 * @param callback callback
 */
function loadTemplates( callback ) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    //Load templates
    var cachemdktemplatesFile = path.join(mdkpath().cacheDir, 'mdktemplates.json');
    var defaultmdktemplatesFile = path.join(__dirname, 'mdktemplates.json');

    fs.access(cachemdktemplatesFile,fs.R_OK, function(err) {
        if ( err ) {
            fs.readJson(defaultmdktemplatesFile, callback);
        }
        else {
            fs.readJson(cachemdktemplatesFile, callback);
        }
    });
}


module.exports = load;
"use strict"

var fs = require('fs-extra');
var assert = require('assert');
var path = require('path');

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
            //TODO: show warning, use clc
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

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');

    //Retrieve last versions if needed
    var cacheMdkVersions = path.join(system.userHome(), '/.mdk/cache/mdkversions.json');

    fs.access(cacheMdkVersions, fs.R_OK, function(err) {
        if ( err || forceUpdate ) {
            var options = {};
            options.url = config.get('mdkUrl', callback) + '/mdkversions.json';
            network.downloadFile(options, '~/.mdk/cache/mdkversions', callback);
        }
        else {
            callback();
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

    //Load versions
    var cacheMdkVersions = path.join(system.userHome(), '/.mdk/cache/mdkversions.json');
    var defaultMdkVersions = path.join(__dirname, '/mdkversions.json');

    fs.access(cacheMdkVersions,fs.R_OK, function(err) {
        if ( err ) {
            fs.readJson(defaultMdkVersions, callback);
        }
        else {
            fs.readJson(cacheMdkVersions, callback);
        }
    });
}


module.exports = load;
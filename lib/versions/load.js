"use strict"

var fs = require('fs-extra');
var config = require('../config');
var network = require('../utils/network');
var system = require('../utils/system');
var parser = require('../utils/io');

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

    var cacheMdkVersions = system.userHome() + "/.mdk/cache/mdkversions.json";
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
    var cacheMdkVersions = system.userHome() + "/.mdk/cache/mdkversions.json";
    var defaultMdkVersions = __dirname + "/mdkversions.json";
    fs.access(cacheMdkVersions,fs.R_OK, function(err) {
        if ( err ) {
            parser.parseJSONFile(defaultMdkVersions, callback);
        }
        else {
            parser.parseJSONFile(cacheMdkVersions, callback);
        }
    });

    //TODO: use ~/.mdk/cache/mdkversions.json if exists, else use mdkversions.json in __dirname + '/../mdkversions.json'
}


module.exports = load;
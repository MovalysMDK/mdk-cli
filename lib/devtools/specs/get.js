/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

var config = require('../../config');
var versions = require('../../mdk/versions');
var network = require('../../utils/network');
var system = require('../../utils/system');
var mdkpath = require('../../mdkpath');

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
            var fileName = "devtools-" + versionInfo.devToolsVersion + ".json";

            var cacheDevToolDir = mdkpath().devtoolsSpecDir;
            var cacheDevtoolVersionFile =  path.join(cacheDevToolDir, fileName);
            var productDevtoolVersionFile = path.join(__dirname, '..', fileName);

            retrieveDevToolSpec(forceUpdate, productDevtoolVersionFile, cacheDevtoolVersionFile, cacheDevToolDir, fileName, function( err) {
                if ( err) {
                    callback(err);
                }
                else {
                    loadVersion(versionInfo.devToolsVersion, productDevtoolVersionFile, cacheDevtoolVersionFile, callback);
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
 * @param productDevtoolVersionFile The devtools mdk file from this product
 * @param cacheDevtoolVersionFile The devtools mdk file from cache
 * @param callback callback
 */
function loadVersion(devToolsVersion, productDevtoolVersionFile, cacheDevtoolVersionFile, callback) {



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
    };

    //First try to retrieve product file devtool version
    //Otherwhise try to retrieve cache version file
    fs.access(productDevtoolVersionFile, function(productErr) {
        if(productErr) {
            fs.access(cacheDevtoolVersionFile, function(cacheErr) {
                if(cacheErr) {
                    callback('No devtools version file found for devtools version ' + devToolsVersion);
                }
                else {
                    //console.log("read devtools file from cache");
                    fs.readJson(cacheDevtoolVersionFile, readJsonCallback);
                }
            });
        }
        else {
            //console.log("read devtools file from npm-cli installation.");
            fs.readJson(productDevtoolVersionFile, readJsonCallback);
        }
    });
}

/**
 * Retrieve devtools-version.json from mdk website.
 * <p>Update is run if no mdkdevtools-version.json in cache or forceUpdate is true.</p>
 * @param forceUpdate force download from mdk website.
 * @param callback callback
 * @param productDevtoolVersionFile The devtools mdk file from this product
 * @param cacheDevtoolVersionFile The devtools mdk file from cache
 * @param cacheDevToolDir Tje devtools cache directory
 * @param fileName The name of devtools mdk file
 */
function retrieveDevToolSpec(forceUpdate, productDevtoolVersionFile, cacheDevtoolVersionFile,
                              cacheDevToolDir, fileName, callback ) {

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
            network.downloadFile(options, fileName, false, callback);
        }
    });
}
module.exports = get;
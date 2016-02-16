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

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');

var io = require('../../utils/io');
var mdkLog = require('../../utils/log');
var config = require('../../config');
var network = require('../../utils/network');
var mdkpath = require('../../mdkpath');

/**
 * Force to use the cache for every file if one download fails, 
 * so that files versions are homogeneous.
 * It is "global" to this module as it is used to download multiple files
 * at several times during execution of commands.
 */
var forceCacheAfterFail = false;

/**
 * Retrieve mdk file from mdk website.
 * Update is run if no MDK file in cache or forceUpdate is true.
 * @param forceUpdate force download from mdk website.
 * @param mdkFileName the name of the file to load
 * @param productDirectory The product directory that contains the MDK File
 * @param callback callback
 */
function retrieveLastMDKFile( forceUpdate, productDirectory, mdkFileName, callback ) {

    var mdkPaths = mdkpath();
    var cacheMDKFile = path.join( mdkPaths.cacheDir, mdkFileName);
    var options = {};

    async.waterfall([
        function(cb) {
            // create cache dir if it does not exists.
            fs.ensureDir(mdkPaths.cacheDir, function(err) {
                cb(err);
            });
        },
        function(cb) {
            checkCachedVersion(cacheMDKFile, productDirectory, mdkFileName, cb);
        },
        function(inCache, cb) {
            // if mdk file is older than one day, an update will be performed.
            var needRefresh = !inCache || io.timeSinceLastModification(cacheMDKFile) > 1000 * 60 * 60 * 24;
            cb(null, (forceUpdate || needRefresh) && ! forceCacheAfterFail);
        },
        function( doDownload, cb) {
            if ( doDownload ) {
                // get url from configuration
                config.get('mdkUrl', function (err, baseUrl) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        // download mdkFileName
                        options.url = baseUrl + "/" + mdkFileName;
                        network.downloadFile(options, cacheMDKFile, true, function (err) {
                            if (err) {
								// If one download fail, we set this flag to true so that
								// no other download will be attempted, so that files versions
								// are homogeneous
								forceCacheAfterFail = true;
								mdkLog.warn( "Download failed", "MDK CLI will use cached files because a download failed : " + options.url);
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
 * Check if mdk file is valid.
 * <ul>
 *     <li>the file exists</li>
 *     <li>file is newer than the one in the product directory.</li>
 * </ul>
 * If file exists and not valid, the file is removed from cache.
 * @param cacheMDKFile The path of cached file
 * @param productDirectory The product directory that contains the MDK File
 * @param mdkFileName The name of the MDK file to load
 * @param callback Callback
 */
function checkCachedVersion(cacheMDKFile, productDirectory, mdkFileName, callback) {

    assert.equal(typeof cacheMDKFile, 'string');
    assert.equal(typeof callback, 'function');

    // test if MDK file is in cache.
    fs.access(cacheMDKFile, fs.R_OK, function(err) {
        if (err) {
            callback(null, false);
        }
        else {
            var productMDKFile = productDirectory + "/" + mdkFileName;
            if( io.compareLastModificationDate(productMDKFile, cacheMDKFile) > 0 ) {
               
			   callback(null, false);
			   
			    // DISABLED == delete cached MDK File.
				/*
                fs.remove(cacheMDKFile, function(err) {
                    callback(err, false);
                });
				*/
            }
            else {
                callback(null, true);
            }
        }
    });
}

module.exports = retrieveLastMDKFile;
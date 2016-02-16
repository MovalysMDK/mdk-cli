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
var assert = require('assert');
var path = require('path');
var async = require('async');
var clc = require('cli-color');

var io = require('../../utils/io');
var mdkLog = require('../../utils/log');
var config = require('../../config');
var network = require('../../utils/network');
var system = require('../../utils/system');
var mdkpath = require('../../mdkpath');
var retrieveLastMDKFile = require('./retrieveLastMDKFile');


/**
 * Load a MDK file
 * @param forceUpdate force checking for a new MDK file file on mdk website.
 * @param mdkFileName The MDK nale of the file to load
 * @param  productDirectory The product directory that contains the MDK File
 * @param callback
 */
function load(forceUpdate, productDirectory, mdkFileName, callback) {

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');

    //Retrieve last MDK file  then load MDK file
    retrieveLastMDKFile( forceUpdate, productDirectory, mdkFileName, function(err) {

        if ( err) {
            // don't fail on retrieving MDK file
            clc.yellow('[WARN] Update of ' + mdkFileName + ' failed: ' + err);
        }
        loadMDKFile(mdkFileName, productDirectory, callback);
    });
}


/**
 * Load MDK file file from following locations :
 * <ul>
 *     <li>~/.mdk/cache/#loadMDKFile#</li>
 *     <li>mdk-cli installation directory</li>
 * </ul>
 * @param callback callback
 * @param mdkFileName The name of the MDK file to load
 */
function loadMDKFile(mdkFileName, productDirectory, callback ) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    //Load MDK file
    var cacheMDKFile = path.join(mdkpath().cacheDir, mdkFileName);
    var defaultMDKFile = path.join(productDirectory, mdkFileName);

    fs.access(cacheMDKFile,fs.R_OK, function(err) {
        if ( err ) {
            fs.readJson(defaultMDKFile, callback);
        }
        else {
            fs.readJson(cacheMDKFile, callback);
        }
    });
}


module.exports = load;
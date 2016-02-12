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

var assert = require('assert');
var semver = require('semver');

var load = require('./load');


/**
 * Return version info of mdk
 * @param versionToGet mdk version to get
 * @param forceUpdate Indicates if an update must be forced
 * @param callback
 */
function get(versionToGet, forceUpdate, callback) {

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof versionToGet, 'string');
    assert.equal(typeof callback, 'function');

    //Check given version format
    if(semver.valid(versionToGet)) {
        //Load mdk
        load(forceUpdate, function(err, versions) {
            if (err) {
                callback(err);
            }
            else {
                retrieveVersion(versionToGet, versions, callback);
            }
        });
    }
    else {
        callback("'"+ versionToGet +"' is not a valid mdk version format");
    }

}

/**
 * Retrieve a specific version of MDK
 * @param version The version to retrieve
 * @param allVersions All version found from mdkversions files
 * @param callback Callback
 */
function retrieveVersion(version, allVersions, callback) {

    //Check parameters
    assert.equal(typeof version, 'string');
    assert.equal(typeof allVersions, 'object');
    assert.equal(typeof callback, 'function');

    //Retrieve specific version
    var foundItem;
    allVersions.versions.forEach(function(item) {
        if(item.version === version) {
            foundItem = item;
        }
    });
    if(foundItem) {
        callback(null, foundItem);
    }
    else {
        callback("MDK version with name '" + version + "' not found");
    }
}

module.exports = get;

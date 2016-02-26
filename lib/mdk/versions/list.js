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
var async = require('async');

var config = require('../../config/index');
var load = require('./load');

/**
 * Return all mdk of mdk.
 * @param callback
 */
function list(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');


    async.waterfall( [
        function (cb) {
            // read configuration to known where mfxcode is installed.
            config.get("snapshotEnable", cb);
        },
        function(snapshotEnable, cb) {
            load(false, function(err, versions) {
                if (err) {
                    cb(err);
                } else {
                    if (snapshotEnable === 'true') {
                        return cb(null, versions);
                    } else {
                        var filteredVersions = {versions:[]};
                         // Remove SNAPSHOTs
                        versions.versions.forEach(function (version) {
                            // Clone the version

                            if (version.version.indexOf("-SNAPSHOT") === -1) {
                                filteredVersions.versions.push(version);
                            }
                        });

                        return cb(null, filteredVersions);
                    }
                }
            });
        }
    ], function(err, result) {
        if ( err ) {
            callback(err);
        }
        else {
            if(result.versions.length > 0) {
                callback(null, result);
            }
            else {
                callback("No version found");
            }
            // all checks passed, don't need to reinstall
        }
    });


//Load mdk

}

module.exports = list;
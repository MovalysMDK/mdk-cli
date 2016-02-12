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
var semver = require('semver');

var config = require('../../config/index');
var load = require('./load');
var list = require('./list');

/**
 * Return the last version of mdk
 * @param callback
 */
function lastVersion(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // read configuration to known if we use Snapshots
            config.get("snapshotEnable", cb);
        },
        function(snapshotEnable, cb) {
			
			/*
            load(false, function(err, versions) {
                if (err) {
                    cb(err);
                }
                else {
                    var lastVersion;
                    versions.versions.forEach(function (item) {
                            if (item.version.indexOf("-SNAPSHOT") != -1 && snapshotEnable === 'false') {
                                return;
                            }
							if ( semver.gt(item.version, lastVersion) ){
								lastVersion = item.version;
							}
                        }	
                    );
                    if (lastVersion) {
                        cb(null, lastVersion);
                    } else {
                        cb("No version found");
                    }


                }
            });
			*/
			
			list(function(err, mdks){
				if (err){
					return cb(err);
				}
				
				var lastVersion = "0.0.0-FAKE";
				mdks.versions.forEach(function (item) {
						// list is already stripped from SNAPSHOTs if it is config to false
						if ( semver.gt(item.version, lastVersion) ){
							lastVersion = item.version;
						}
					}	
				);
				if (lastVersion) {
					cb(null, lastVersion);
				} else {
					cb("No version found");
				}
			});
			
        },

    ], function(err, result) {
        if ( err ) {
            callback(err);
        }
        else {
            // all checks passed, don't need to reinstall
            callback(null, result);
        }
    });

}


module.exports = lastVersion;
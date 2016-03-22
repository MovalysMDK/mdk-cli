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

var async = require('async');
var load = require('./load');
var config = require('../../config/index');


/**
 * Return the list of templates (Take snapshot-enable option into account)
 * If only Snapshots versions are available and "snapshot-enabled=false", the template isn't return.
 * @param forceUpdate Indicates if an update must be forced
 * @param callback
 */
function list(forceUpdate, callback) {
    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // read configuration to known if we can use SNAPSHOTs.
            config.get("snapshotEnable", cb);
        },
        function(snapshotEnable, cb) {
            load(forceUpdate, function(err, templates) {
                if (err) {
                    cb(err);
                } else {
                    if (snapshotEnable) {
                        return cb(null, templates);
                    } else {
                        var filteredTemplates = {templates:[]};

                        // Remove SNAPSHOTs
                        templates.templates.forEach(function (template) {
                            // Clone the template
                            var clonedTemplate = JSON.parse(JSON.stringify(template));
                            var filteredVersions=[];
                            template.versions.forEach(function (item) {
                                if (item.version.indexOf("-SNAPSHOT") === -1) {
                                    filteredVersions.push(item);
                                }
                            });
                            // If there is at least one non Snapshot version, keep the template
                            clonedTemplate.versions = filteredVersions;

                            if (clonedTemplate.versions.length > 0) {
                                filteredTemplates.templates.push(clonedTemplate);
                            }
                        });

                        return cb(null, filteredTemplates);
                    }
                }
            });
        },
    ], function(err, result) {
        if ( err ) {
            callback(err);
        } else {
            if(result.templates.length > 0) {
                callback(null, result);
            }
            else {
                callback("No template found");
            }
        }
    });
}

module.exports = list;

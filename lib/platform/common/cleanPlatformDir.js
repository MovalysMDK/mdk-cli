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
'use strict';

var fs = require('fs-extra');
var async = require('async');
var glob = require("glob");
var path = require('path');
var assert = require('assert');

/**
 * Clean platform: remove unused files.
 * @param platformName platform name
 * @param callback callback
 */
function cleanPlatformDir(platformName, callback) {

    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall([
        function (cb) {
            // Remove tools directory
            fs.remove(path.join(platformName, 'tools'), function(err) {
                if ( err ){
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function (cb) {
            // Remove docs directory
            fs.remove(path.join(platformName, 'docs'), function(err) {
                if ( err ){
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function (cb) {
            // Remove all delete-safely files
            glob(platformName + "/**/delete-safely*.txt", {}, function (err, files) {
                if ( err ) {
                    cb(err);
                }
                else {
                    async.eachSeries(files, fs.unlink, function(err) {
                        if (err) {
                            cb();
                        }
                        else {
                            cb(err);
                        }
                    });
                }
            });
        }
    ],
    function(err) {
        if ( err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = cleanPlatformDir;
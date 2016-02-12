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
var assert = require('assert');
var async = require('async');
var path = require('path');

var system = require('../../../utils/system');

/**
 * Compute if a pod update needs to be performed.
 * @param callback
 */
function needPodUpdate(callback) {

    assert.equal(typeof callback, 'function');

    var podFile = path.join("ios", "Podfile");
    var podFileLock = path.join("ios", "Podfile.lock");

    fs.access(podFileLock, fs.F_OK, function(err) {
        if ( err ) {
            // if Podfile.lock is missing, a pod update is required.
            callback(null, true);
        }
        else {
            fs.stat(podFile, function(err, stats) {
                if ( err ) {
                    callback(err);
                }
                else {
                    fs.stat(podFileLock, function (err, lockStats) {
                        if ( err ) {
                            callback(err);
                        }
                        else {
                            // If podfile modification date is superior, a pod update needs to be run.
                            callback(null, stats.mtime.getTime() > lockStats.mtime.getTime());
                        }
                    });
                }
            });
        }
    });
}

module.exports = needPodUpdate ;
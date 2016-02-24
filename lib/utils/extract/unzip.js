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
var zip = require('extract-zip');

/**
 * Extract files from zip archive.
 * @param archive zip file
 * @param targetDir destination
 * @param callback callback
 */
function unzip(archive, targetDir, callback) {

    assert.equal(typeof archive, 'string');
    assert.equal(typeof targetDir, 'string');
    assert.equal(typeof callback, 'function');

    zip(archive, {dir: targetDir}, function (err) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = unzip;
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
var zlib = require('zlib');
var tar = require('tar-fs');

/**
 * Extract files from tar.gz archive.
 * @param archive tar.gz file
 * @param targetDir destination
 * @param callback callback
 */
function untarGz(archive, targetDir, callback) {

    assert.equal(typeof archive, 'string');
    assert.equal(typeof targetDir, 'string');
    assert.equal(typeof callback, 'function');

    var rstream = fs.createReadStream(archive);
    var gunzip = zlib.createGunzip();
    var extract = tar.extract(targetDir);

    rstream
        .pipe(gunzip)
        .pipe(extract);

    rstream.on('error', function(err) {
        callback("archive read error:" + err);
    });

    gunzip.on('error', function(err) {
        callback("gzip error:" + err);
    });

    extract.on('error', function(err) {
        callback("tar error:" + err);
    });
    extract.on('finish', function() {
        callback();
    });
}

module.exports = untarGz;
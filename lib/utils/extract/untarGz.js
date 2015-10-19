"use strict";

var fs = require('fs-extract');
var assert = require('assert');
var zlib = require('zlib');

var tar = require('./tar');

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

    rstream.on('error', callback);
    gunzip.on('error', callback);
    extract.on('error', callback);
    extract.on('finish', callback);
}

module.exports = untarGz;
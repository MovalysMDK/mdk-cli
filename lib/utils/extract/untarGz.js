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
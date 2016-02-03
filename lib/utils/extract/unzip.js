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
    })
}

module.exports = unzip;
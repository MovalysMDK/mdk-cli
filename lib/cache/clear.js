"use strict";

var assert = require('assert');
var path = require('path');
var fs = require('fs-extra');
var system = require('../utils/system');
var mdkpath = require('../mdkpath');

/**
 * Delete cache of mdk-cli.
 * <p>Delete all the content of $MDK_HOME/cache.</p>
 * @param callback Callback
 */
function clear(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    var userCacheDirectory = mdkpath().cacheDir;
    fs.remove(userCacheDirectory, callback);
}


module.exports = clear;
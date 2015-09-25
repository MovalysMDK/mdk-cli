"use strict"

var assert = require('assert');
var rimraf = require('rimraf');
var path = require('path');

var system = require('../utils/system');


/**
 * Delete cache of mdk-cli.
 * <p>Delete all the content of ~/.mdk/cache.</p>
 * @param callback Callback
 */
function clear(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');

    var userCacheDirectory = path.join(system.userHome(), ".mdk", "cache");
    rimraf(userCacheDirectory, callback);
}


module.exports = clear;
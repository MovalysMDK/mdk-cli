"use strict";

var assert = require('assert');
var path = require('path');
var fs = require('fs-extra');
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
    fs.remove(userCacheDirectory, callback);
}


module.exports = clear;
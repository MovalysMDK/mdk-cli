"use strict"

var clear = require('./clear');

/**
 * Delete cache of mdk-cli.
 * <p>Delete all the content of ~/.mdk/cache.</p>
 * @param callback Callback
 */
function clear(callback) {

    //TODO: use rimraf to delete cache directory

    callback();
}


module.exports = clear;
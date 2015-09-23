"use strict"

/**
 * Return version info of mdk.
 * @param mdkVersion mdk version
 * @param forceUpdate force update from mdk website
 * @param callback
 */
function get(mdkVersion, forceUpdate, callback) {

    callback(null, JSON.parse('{"version": "5.0.1","devToolsVersion": "2.0.0"}')); //TODO
}

module.exports = get;
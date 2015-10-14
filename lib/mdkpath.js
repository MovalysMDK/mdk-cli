"use strict";

var fs = require('fs');
var path = require('path');
var system = require('./utils/system');

/**
 * Return MDK_HOME directory where mdk configuration/tools/cache are located.
 * @return directory where mdk configuration/tools/cache are located.
 */
function mdkpaths() {
    var result = {};

    // compute home dir
    if ( typeof process.env.MDK_HOME !== 'undefined' ) {
        result.homeDir = process.env.MDK_HOME;
    }
    else {
        result.homeDir = path.join(system.userHome(), ".mdk");
    }

    // cache dir
    result.cacheDir = path.join(result.homeDir, "cache");

    // tmp dir
    result.tmpDir = path.join(result.homeDir, "tmp");

    // packages dir
    result.packagesDir = path.join(result.cacheDir, "packages");

    // conf dir
    result.confDir = path.join(result.homeDir, "conf");

    // tools dir
    result.toolsDir = path.join(result.homeDir, "tools");

    // data dir
    result.dataDir = path.join(result.homeDir, "data");

    // spec devtools dir
    result.devtoolsSpecDir = path.join(result.cacheDir, "devtools");

    return result;
}

module.exports = mdkpaths;

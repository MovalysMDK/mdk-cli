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

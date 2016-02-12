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
'use strict';

var assert = require('assert');
var computeDefinition = require('./computeDefinition');

/**
 * Compute command to append a directory in the PATH env variable.
 * @param directory variable name
 * @param osName os name
 * @return string command to append directory to path.
 */
function computeAppendToPath(directory, osName ) {

    assert.equal(typeof directory, 'string');
    assert.equal(typeof osName, 'string');

    var newPath = directory;
    switch(osName){
        case "osx":
            newPath = newPath + ":$PATH";
            break;
        case "win":
            newPath = newPath + ";%PATH%";
            break;
    }
    return computeDefinition("PATH", newPath, osName);
}

module.exports = computeAppendToPath;
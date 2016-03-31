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

var fs = require('fs-extra');
var replaceInFile = require('../../../utils/io/replaceInFile');
var path = require('path');

function excludePackage( conf, cb) {

    // Search Position In File
    var searchPositionInFile = "</configFiles>";

    // Insert Exclude In File
    if (conf.umlExcludes && conf.umlExcludes[conf.platformName] && conf.umlExcludes[conf.platformName].length > 0) {
        var packageExcludes = conf.umlExcludes[conf.platformName];
        console.log('  modify pom project - include umlExcludes');
        var includeExcludePackage = "</configFiles>\n<umlExcludes>";

        for (var i = 0; i < packageExcludes.length; i++) {
            includeExcludePackage += "\n<umlExclude>";
            includeExcludePackage += packageExcludes[i];
            includeExcludePackage += "</umlExclude>";
        }
        includeExcludePackage += "\n</umlExcludes>";

        // Replace String In File
        replaceInFile(path.join(conf.platformName,'pom.xml'), searchPositionInFile, includeExcludePackage, cb);
    }
    else {
        cb();
    }
}

module.exports = excludePackage;
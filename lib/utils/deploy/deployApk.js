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

var fs = require('fs-extra');
var async = require('async');
var path = require('path');

var buildNumber = require('./buildNumber');

function deployApk( apkFileName, deployDir, conf, callback ) {

    var buildNr = buildNumber();
    var apkName = conf.project.artifactId + '-' + buildNr + '.apk';
    var minor = /([0-9]*\.[0-9]*)/g.exec(conf.project.mdkVersion)[1];
    
    fs.copySync( apkFileName, path.join(deployDir, minor, conf.project.artifactId, apkName));
    
    fs.writeFileSync(path.join(deployDir, minor, conf.project.artifactId, 'version'), buildNr);
    fs.writeFileSync(path.join(deployDir, minor, conf.project.artifactId, 'mdk_version'), conf.project.mdkVersion);
    callback();
}

module.exports = deployApk;
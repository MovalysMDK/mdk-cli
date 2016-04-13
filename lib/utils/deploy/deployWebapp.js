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

var path = require('path');
var fs = require('fs-extra');

var buildNumber = require('./buildNumber');
var linkForceAsync = require('../io/linkForceAsync');

function deployWebapp( webappDir, deployDir, conf, callback ) {
    
    var buildNr = buildNumber();

    fs.copySync( webappDir, path.join(deployDir, conf.project.mdkVersion, conf.project.artifactId, buildNr));

    fs.writeFileSync(path.join(deployDir, conf.project.mdkVersion, conf.project.artifactId, buildNr, 'version'), buildNr);
    fs.writeFileSync(path.join(deployDir, conf.project.mdkVersion, conf.project.artifactId, buildNr, 'mdk_version'), conf.project.mdkVersion);
    
    
    var isWin = /^win/.test(process.platform);
    if ( isWin ) {
        var currentDir = path.join(conf.html5.deployDir, conf.project.mdkVersion, conf.project.artifactId, 'current');
        fs.copySync(path.join(deployDir, conf.project.mdkVersion, conf.project.artifactId, buildNr),
                    currentDir, {forceDelete: true}, callback);
    }
    else {
        var currentLnk = path.join(conf.html5.deployDir, conf.project.mdkVersion, conf.project.artifactId, 'current');
        linkForceAsync(path.join(deployDir, conf.project.mdkVersion, conf.project.artifactId, buildNr),
                         currentLnk, null, callback);
    }
    callback();
}

module.exports = deployWebapp;
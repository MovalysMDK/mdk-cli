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
"use strict"

var path = require('path');
var fs = require('fs-extra');

var buildNumber = require('./buildNumber');
var linkForceAsync = require('../io/linkForceAsync');

function deployWebapp( webappDir, conf, callback ) {
    
    if ( conf.deployDir ) {

        var buildNr = buildNumber();

        var deployDir = path.join(conf.deployDir, conf.project.mdkVersion, conf.project.artifactId);

        fs.mkdirsSync(deployDir);
        deployDir = path.join(deployDir, buildNr);

        fs.copySync( webappDir, deployDir);

        fs.writeFileSync(path.join(deployDir, 'version'), buildNr);
        fs.writeFileSync(path.join(deployDir, 'mdk_version'), conf.project.mdkVersion);
        callback();
        // var isWin = /^win/.test(process.platform);
        // if ( isWin ) {
        //     var currentDir = path.join(conf.deployDir.html5, conf.project.mdkVersion, conf.project.artifactId, 'current');
        //     fs.copySync( deployDir, currentDir, {forceDelete: true}, callback );
        // }
        // else {
        //     var currentLnk = path.join(conf.deployDir.html5, conf.project.mdkVersion, conf.project.artifactId, 'current');
        //     linkForceAsync(deployDir, currentLnk, null, callback);
        // }
    }
    else {
        callback();
    }
}

module.exports = deployWebapp;
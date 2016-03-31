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
var path = require('path');
var async = require('async');

var buildNumber = require('./buildNumber');
var copyFile = require('../io/copyFile');

function deployWin8( sourceFile, deployDir, conf, callback ) {
    var buildNr = buildNumber();
    //console.log('buildNr:' +buildNr);

    var extension = '.' + sourceFile.split('.').pop();
    //console.log('extension:' +extension);

    var destName = conf.project.artifactId + '-' + buildNr + extension;
    //console.log('destName:' +destName);

    async.series( [
        function(cb) {
            fs.mkdirs( path.join(deployDir, conf.project.artifactId ), cb);
        },
        function(cb) {
            //console.log('copyfile 1');
            copyFile( sourceFile, path.join(deployDir, conf.project.artifactId, destName));

            //console.log('copyfile 2');
            //console.log('  ' + path.join(deployDir, conf.project.artifactId, destName));
            //console.log('  ' + path.join(deployDir, conf.project.artifactId, conf.project.artifactId + extension));
            copyFile( path.join(deployDir, conf.project.artifactId, destName), path.join(deployDir, conf.project.artifactId, conf.project.artifactId + extension));

            //console.log('version');
            fs.writeFile( path.join( deployDir, conf.project.artifactId, 'version'), buildNr, null, cb);
        },
        function(cb) {
            //console.log('mdk_version');
            fs.writeFile( path.join( deployDir, conf.project.artifactId, 'mdk_version'), conf.project.mdkVersion, null, cb);
        }
        ],
        function(err,results) {
            if ( err) {
                callback(err);
            } else {
                callback();
            }
        }
    );
}

module.exports = deployWin8;
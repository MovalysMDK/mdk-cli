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

var fs = require('fs-extra');
var async = require('async');
var walk = require('walk');
var path = require('path');

var buildNumber = require('./buildNumber');
var copyFile = require('../io/copyFile');
var linkForceAsync = require('../io/linkForceAsync');

function deployScreenshots( walkDir, deployDir, conf, callback ) {

    var buildNr = buildNumber();
    var screenshotDir = 'screenshots-' + buildNr ;

    async.series([
        function(cb) {
            fs.mkdirs(deployDir + '/' + conf.project.artifactId + '/' + screenshotDir, cb );
        },
        function(cb) {
            var walker = walk.walk(walkDir);
            walker.on("file", function (root, fileStats, next) {
                if ( path.extname(fileStats.name) === ".png") {
                    var imgFile = path.join(root, fileStats.name);
                    copyFile( imgFile, deployDir + '/' +
                        conf.project.artifactId + '/' + screenshotDir + '/' + fileStats.name.substring(fileStats.name.indexOf('_') + 1 ));
                }
                next();
            });

            walker.on("errors", function (root, nodeStatsArray, next) {
                next();
            });

            walker.on("end", function () {
                cb();
            });
        },
        function(cb) {
            linkForceAsync(
                deployDir + '/' + conf.project.artifactId + '/' + screenshotDir,
                deployDir + '/' + conf.project.artifactId + '/screenshots', null, cb);
        }
    ],
    function(err, results) {
        if ( err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = deployScreenshots;
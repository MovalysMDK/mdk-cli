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
var async = require('async');
var fs = require('fs-extra');
var path = require('path');
var mdkpath = require('../../mdkpath')();

var deployApk = require('../../utils/deploy/deployApk');
var deployScreenshots = require('../../utils/deploy/deployScreenshots');
var deployDiagrams = require('../../utils/deploy/deployDiagrams');

/**
 * Deploy android app.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function deploy( projectConf, toolSpecs, osName, callback ) {
    if (!projectConf.project.buildDisable && projectConf.deployDir) {
        // deploy apk
        var apkFile = null;
        console.log("  deploy apk");
        apkFile = path.join('android/app/build/outputs/apk/app-debug.apk');


        deployApk( apkFile, path.join(projectConf.deployDir, projectConf.project.mdkVersion), projectConf,callback);
            // function(err,success) {
            //     if ( err ) {
            //         callback(err);
            //     }
            //     else {
            //         deployScreenshots(
            //             'app/build/spoon/debug/image/emulator-5554/',
            //             path.join(projectConf.deployDir, projectConf.project.mdkVersion),
            //             projectConf, function(err) {
            //                 if ( err ) {
            //                     callback(err);
            //                 }
            //                 else {
            //                     deployDiagrams(
            //                         '../drawable',
            //                         path.join(projectConf.deployDir, projectConf.project.mdkVersion),
            //                         projectConf, callback);
            //                 }
            //         });
            //     }
            // });
    } else {
        callback();
    }
}

module.exports = deploy;
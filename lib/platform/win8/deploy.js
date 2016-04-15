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
var exec = require('child_process').exec;
var config = require('../../config');
var path = require('path');

var mdkLog = require('../../utils/log');
var deployWin8 = require('../../utils/deploy/deployWin8');
var buildNumber = require('../../utils/deploy/buildNumber');

/**
 * Deploy win8 app.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function deploy( projectConf, toolSpecs, osName, callback ) {
    if (!projectConf.project.buildDisable) {
        
        config.get('deployDir',function(err,result) {
            var deployDir = path.join(process.cwd(),'win8Deploy');
            if (result) {
                deployDir = path.join(result,'w8-native');
            }
            var buildNr = buildNumber();
            
            // var manifest = fs.readFileSync(path.join(AppDir,'Package.appxmanifest'));
            // var appVersion = /Version="(.*)" \/>/g.exec(manifest)[1];
            // var appxName = conf.project.artifactId + '-' + buildNr + '.apk';

            // var phoneDir = path.join(process.cwd(),'win8',projectConf.project.artifactId,'Win8Phone');
            // var phoneProjDir = path.join(phoneDir,projectConf.project.artifactId + 'Phone.csproj');
            // var phoneAppx = path.join(phoneDir,'AppPackages');
            // var phoneAppxName = projectConf.project.artifactId + '-phone-' + buildNr + '.apk';

            // var storeDir = path.join(process.cwd(),'win8',projectConf.project.artifactId,'Win8Store');
            // var storeProjDir = path.join(storeDir,projectConf.project.artifactId + 'Store.csproj');
            // var storeAppx = path.join(storeDir,'AppPackages');
            // var storeAppxName = projectConf.project.artifactId + '-store-' + buildNr + '.apk';

            // deployWin8(phoneDir, phoneProjDir, phoneAppx, deployDir, phoneAppxName, projectConf, buildNr, function(err) {
            //     if (!err) {
            //         mdkLog.ok('deploy win8 phone to ' + deployDir, 'success');
            //     }
            //     deployWin8(storeDir, storeProjDir, storeAppx, deployDir, storeAppxName, projectConf, buildNr, function(err) {
            //         if (!err) {
            //             mdkLog.ok('deploy win8 store to ' + deployDir, 'success');
            //         }
            //         callback();
            //     });
            // });
            var Dir =path.join(process.cwd(),'win8',projectConf.project.artifactId);
            deployWin8(Dir, deployDir,'Phone','ARM',projectConf,buildNr,function(err) {
                if (!err) {
                    mdkLog.ok('deploy win8 phone to ' + deployDir, 'success');
                }
                deployWin8(Dir, deployDir,'Store','x86',projectConf,buildNr,function(err) {
                    if (!err) {
                        mdkLog.ok('deploy win8 store to ' + deployDir, 'success');
                    }
                    callback();
                });
            });
        });
    } else {
        callback();
    }
}

module.exports = deploy;
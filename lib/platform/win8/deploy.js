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

var mdkLog = require('../../utils/log');
var runAsync = require('../../utils/runAsync');
var buildIpa = require('../../utils/deploy/buildIpa');

/**
 * Deploy win8 app.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function deploy( projectConf, toolSpecs, osName, callback ) {
    if (!projectConf.project.buildDisable) {
        
        var deployDir = path.join(process.cwd(),'win8Deploy', projectConf.project.mdkVersion);
        
        var phoneDir = path.join(process.cwd(),'win8',projectConf.project.artifactId,'Win8Phone');
        var phoneAppDir = path.join(phoneDir,projectConf.project.artifactId + 'Phone.csproj');
        var phoneAppx = path.join(phoneDir,'AppPackages');
        
        var storeDir = path.join(process.cwd(),'win8',projectConf.project.artifactId,'Win8Store');
        var storeAppDir = path.join(storeDir,projectConf.project.artifactId + 'Store.csproj');
        var storeAppx = path.join(storeDir,'AppPackages');

        var mspath;
        if (process.env.ProgramFiles) {
            mspath = path.join(process.env.ProgramFiles,'MSBuild','12.0','bin');
            process.env.PATH = mspath + ';' + process.env.PATH;
        }
        if (process.env['ProgramFiles(x86)']) {
            mspath = path.join(process.env['ProgramFiles(x86)'],'MSBuild','12.0','bin');
            process.env.PATH = mspath + ';' + process.env.PATH;
        }

        var command = 'msbuild /p:AppxBundlePlatforms="Any CPU"/p:AppxBundle=Always/p:Configuration=DEBUG /p:OutputPath="' + deployDir + '" ' ;
        runAsync(command + phoneAppDir, 'error: MSBuild failed on solution ' + phoneAppDir, function(err) {
            if (err) {
                callback(err);
            }
            else {
                fs.copySync(phoneAppx,deployDir);
                mdkLog.ok('deploy : ' + phoneAppDir, 'success');
                command = 'msbuild /p:Platform=x86 /p:AppxBundle=Always /p:Configuration=DEBUG /p:OutputPath="' + deployDir + '" ' ;
                runAsync(command + storeAppDir, 'error: MSBuild failed on solution ' + storeAppDir , function(err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        fs.copySync(storeAppx,deployDir);
                        mdkLog.OK('deploy : ' + storeAppDir, 'success');
                        callback();
                    }
                });
            }
        });
    } else {
        callback();
    }
}

module.exports = deploy;
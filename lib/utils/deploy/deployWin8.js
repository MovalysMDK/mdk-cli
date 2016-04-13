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

var copyFile = require('../io/copyFile');
var runAsync = require('../runAsync');

function deployWin8( AppDir, AppxDir, deployDir, conf, buildNr, callback ) {
    
    var mspath;   
            
    if (process.env.ProgramFiles) {
        mspath = path.join(process.env.ProgramFiles,'MSBuild','12.0','bin');
        process.env.PATH = mspath + ';' + process.env.PATH;
    }
    if (process.env['ProgramFiles(x86)']) {
        mspath = path.join(process.env['ProgramFiles(x86)'],'MSBuild','12.0','bin');
        process.env.PATH = mspath + ';' + process.env.PATH;
    }
    
    var command = 'msbuild /p:Platform=x86 /p:AppxBundle=Always /p:Configuration=DEBUG /p:OutputPath="' + path.join(deployDir, conf.project.mdkVersion, conf.project.artifactId, buildNr) + '" ' ;
    runAsync(command + AppDir, 'error: MSBuild failed on solution ' + AppDir , function(err) {
        fs.copySync(AppxDir,path.join(deployDir, conf.project.mdkVersion, conf.project.artifactId, buildNr));
        callback(err);
    });
    
}

module.exports = deployWin8;
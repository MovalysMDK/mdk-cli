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
var AdmZip = require('archiver');
var archiver = require('archiver');

var copyFile = require('../io/copyFile');
var runAsync = require('../runAsync');

var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
};

function deployWin8( AppDir, deployDir, buildTarget, archi, conf, buildNr, callback ) {
    
    var mspath;
    var archive = archiver('zip');
    archive.on('error', function(err){
        throw err;
    });
    var minor = /([0-9]*\.[0-9]*)/g.exec(conf.project.mdkVersion)[1];

    AppDir = path.join(AppDir,'Win8'+buildTarget);
    
    var manifest = fs.readFileSync(path.join(AppDir,'Package.appxmanifest'));
    var appVersion = /Version="(.*)" \/>/g.exec(manifest)[1];
    var AppxDir = conf.project.artifactId + buildTarget + '_' + appVersion + '_' + archi + '_DEBUG_TEST';

    var csproj = path.join(AppDir,conf.project.artifactId + buildTarget + '.csproj');
    var AppPackages = path.join(AppDir,'AppPackages');
    
    if (process.env.ProgramFiles) {
        mspath = path.join(process.env.ProgramFiles,'MSBuild','12.0','bin');
        process.env.PATH = mspath + ';' + process.env.PATH;
    }
    if (process.env['ProgramFiles(x86)']) {
        mspath = path.join(process.env['ProgramFiles(x86)'],'MSBuild','12.0','bin');
        process.env.PATH = mspath + ';' + process.env.PATH;
    }
    
    mkdirSync(deployDir);
    mkdirSync(path.join(deployDir,minor));
    mkdirSync(path.join(deployDir,minor,conf.project.artifactId));
    var command = 'msbuild /p:Platform=x86 /p:AppxBundle=Always /p:Configuration=DEBUG';
    runAsync(command + AppDir, 'error: MSBuild failed on solution ' + AppDir , function(err) {
        var output = fs.createWriteStream(path.join(deployDir, minor, conf.project.artifactId, conf.project.artifactId + '-' + buildNr + '-' + buildTarget + '.zip'));
        archive.pipe(output);
        archive.bulk([
            { expand: true, cwd: path.join(AppDir, 'AppPackages', AppxDir), src: ['**'], dest: '.'}
        ]);
        archive.finalize();
        
        fs.writeFileSync(path.join(deployDir, minor, conf.project.artifactId, 'version'), buildNr);
        fs.writeFileSync(path.join(deployDir, minor, conf.project.artifactId, 'mdk_version'), conf.project.mdkVersion);
        
        output.on('close', function () {
            callback(err);
        });
    });
}


module.exports = deployWin8;
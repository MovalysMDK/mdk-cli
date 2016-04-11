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

var assert = require('assert');
var async = require('async');
var spawn = require('child_process').spawn;
var fs = require('fs-extra');


var mdkLog = require('../../utils/log');
var replaceInFile = require('../../utils/io/replaceInFile');
var runAsync = require('../../utils/runAsync');
var compileVS = require('./VS/compileVSSolution');

/**
 * Compile win8 project without a generation
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function compile( projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');


	console.log('  WIN8 compile');
    
	async.waterfall([
        function(cb) {
            fs.access("win8", fs.R_OK, function (err) {
                if (err) {
                    cb('Platform win8 does not exists.');
                }
                else {
                    process.chdir(projectConf.platformName);
                    cb();
                }
            });
        },
        function(cb) {
            // Add the snapshots NuGet server to the available servers
            mdkLog.notice('  Adding the MDK internal snapshot NuGet server to the list of available servers');
            replaceInFile(projectConf.project.artifactId + '/NuGet.config',
            '<packageSources>',
            '<packageSources>\r\n        <add key="MDK Internal Snapshot Server" value="http://pdtinteg.ptx.fr.sopra/artifactory/api/nuget/prj-mdknuget-snapshots" />');
            cb();
        },
        function(cb) {
            // Nuget Restore : As the directory is fresh new, there was no old package version
            mdkLog.notice('  Restoring nuget packages');
            nugetRestoration(projectConf.project.artifactId, cb);
        },
        function(cb) {
            // Triggers the Init.ps1 scripts from NuGet packages
            mdkLog.notice('  Initializing nuget packages');
            nugetPackagesInit(projectConf, cb);
        },
        function(cb) {
            // compile project solution
            mdkLog.notice('  compiling generated projects');
            compileVS(projectConf.project.artifactId + '/', 'Application.sln',function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            // exit project directory
            process.chdir('../..');
            mdkLog.notice('  w8 done.');
            cb();
        }
		
	], function(err){
		return callback(err);
	});
}


  function nugetRestoration(rootDir, callback) {

      // enter project directory
      process.chdir(rootDir);

      var nugetRestoreCommand = 'nuget restore -NoCache';
      runAsync(nugetRestoreCommand, 'error: nuget restore failed', function(err,result){
          if ( err) {
              callback(err);
          }
          else {
              // exit project directory
              process.chdir('..');
              callback();
          }
      });
  }

  function nugetPackagesInit(conf, callback) {

    // Get packages list
    var packagesRoot = conf.project.artifactId + "/packages/";
    var packagesList = fs.readdirSync(packagesRoot);

    // For each package,run its Init script if it exists
    async.each(packagesList,
      function(item, eachCallback) {
        var packageInstallPath =  packagesRoot + item;
        var packageToolsPath = packageInstallPath + "/Tools/";
        var packageInitScriptPath = packageToolsPath + "Init.ps1";

        if (fs.existsSync(packageInitScriptPath)) {
          runAsync("Powershell.exe -executionpolicy remotesigned -File " +
            packageInitScriptPath +
            " -installPath " + packageInstallPath +
            " -toolsPath " + packageToolsPath +
            " -package null -project null",
            'error: nuget init failed',
            function (err) {
              if (err) {
                eachCallback(err);
              }
              else {
                eachCallback();
              }
            });
          }
          else {
            eachCallback();
          }
      },
      function(err) {
        if (err) {
          callback(err);
        }
        else {
          callback();
        }
      });
  }
  
module.exports = compile;
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

var fs = require('fs-extra');
var async = require("async");
var assert = require("assert");
var path = require("path");

var system = require('../../utils/system');
var cleanPlatformDir = require('../common/cleanPlatformDir');
var config = require('../../config');
var maven = require('../common/maven');

/**
 * Create android project from template.
 * @param projectConf project configuration
 * @param toolSpecs tool specs
 * @param osName os name
 * @param callback callback
 */
function createAndroidProjectFromTemplate( projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    var createProjectArgs = [
        '-s',
        maven.getSettingsXmlFile(),
        '-B',
        'archetype:generate',
        '-DgroupId=' + projectConf.project.groupId,
        '-DartifactId=' + projectConf.project.artifactId,
        '-Dversion=' + projectConf.project.version,
        '-DapplicationName=' + projectConf.project.artifactId,
        '-DadjavaDebug=' + projectConf.options.adjavaDebug,
        '-DxmiFile=../commons/modelisation.xml'
    ].concat(projectConf.options.mavenOptions);

    async.waterfall([

        function(cb) {
            config.getList(["mdkRepoRelease","mdkRepoSnapshots", "snapshotEnable"], function (err, values) {
                if (err) {
                    cb(err);
                }
                else {
                    var archetypeRepositories = values.mdkRepoRelease;
                    if ( values.snapshotEnable && values.mdkRepoSnapshots ) {
                        archetypeRepositories += "," + values.mdkRepoSnapshots ;
                    }

                    async.filter(
						projectConf.template.platforms, 
						function(platform, itemCb) { 
							itemCb( platform.name === "android" );
						},
						function(results){
							if ( results.length === 0 ) {
								return cb("Platform android is not available for this template");
							}else if (results.length === 1){
								createProjectArgs.push('-DarchetypeGroupId=' + results[0].groupId);
								createProjectArgs.push('-DarchetypeArtifactId=' + results[0].artifactId);
								createProjectArgs.push('-DarchetypeVersion=' + projectConf.template.version);
								createProjectArgs.push('-DarchetypeRepository=' + archetypeRepositories);
								return cb();
							}else{
								return cb("Too many platform definitions for the template. Please contact support");
							}
					});
                }
            });
        },
        function(cb) {
            maven.getMvnCmd(toolSpecs, osName, "android", function (err, mvnCmd) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, mvnCmd);
                }
            });
        },
        function(mvnCmd, cb) {
            system.spawn(mvnCmd, createProjectArgs, function(err, output) {
                if (err) {
                    cb('error creating android project: ' + err);
                } else {
                    cb(err);
                }
            });
        },
        function(cb) {
            fs.rename(projectConf.project.artifactId, 'android', function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            // add exec permissions on gradlew
            var gradlewFile = path.join("android", "gradlew");
            fs.chmod(gradlewFile, '0755', cb);
        },
        function(cb) {
            cleanPlatformDir('android', function(err) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        }
    ], function(err) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }

    });
}

module.exports = createAndroidProjectFromTemplate;
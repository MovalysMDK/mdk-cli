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
 * Create win8 project from template.
 * @param projectConf project configuration
 * @param toolSpecs tool specs
 * @param osName os name
 * @param callback callback
 */
function createWIN8ProjectFromTemplate( projectConf, toolSpecs, osName, callback ) {

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
                    if ( values.snapshotEnable === "true" && values.mdkRepoSnapshots ) {
                        archetypeRepositories += "," + values.mdkRepoSnapshots ;
                    }

					async.filter(
						projectConf.template.platforms, 
						function(platform, itemCb) { 
							itemCb( platform.name === "win8" );
						},
						function(results){
							if ( results.length === 0 ) {
								return cb("Platform win8 is not available for this template");
							}else if (results.length === 1){
								createProjectArgs.push('-DarchetypeGroupId=' + results[0].groupId);
								createProjectArgs.push('-DarchetypeArtifactId=' + results[0].artifactId);
								createProjectArgs.push('-DarchetypeVersion=' + projectConf.template.version);
								createProjectArgs.push('-DarchetypeRepository=' + archetypeRepositories);
                                createProjectArgs.push('-Dgoals=com.adeuza:adjava-maven-plugin:uuid-generator');
								return cb();
							}else{
								return cb("Too many platform definitions for the template. Please contact support");
							}
					});
                }
            });
        },
        function(cb) {
            maven.getMvnCmd(toolSpecs, osName, "win8", function (err, mvnCmd) {
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
                    cb('error creating win8 project: ' + err);
                } else {
                    cb(err);
                }
            });
        },
        function(cb) {
            fs.rename(projectConf.project.artifactId, 'win8', function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            cleanPlatformDir('win8', function(err) {
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

module.exports = createWIN8ProjectFromTemplate;
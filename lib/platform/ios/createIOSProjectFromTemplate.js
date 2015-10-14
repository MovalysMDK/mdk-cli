'use strict';

var fs = require('fs-extra');
var async = require("async");
var assert = require("assert");
var path = require("path");

var system = require('../../utils/system');

var cleanPlatformDir = require('../common/cleanPlatformDir');
var config = require('../../config');
var maven = require('../common/maven');
var cocoapods = require('./cocoapods');

/**
 * Create iOS project from template.
 * @param conf configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function createIOSProjectFromTemplate( projectConf, toolSpecs, osName, callback ) {

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

                    createProjectArgs.push('-DarchetypeGroupId=com.sopragroup.adeuza.movalysfwk');
                    createProjectArgs.push('-DarchetypeArtifactId=mdk-ios-project-template');
                    createProjectArgs.push('-DarchetypeVersion=' + projectConf.project.mdkVersion );
                    createProjectArgs.push('-DarchetypeRepository=' + archetypeRepositories);
                    cb();
                }
            });
        },
        function(cb) {
            maven.getMvnCmd(toolSpecs, osName, "ios", function (err, mvnCmd) {
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
                    cb('error creating ios project: ' + err);
                } else {
                    cb(err);
                }
            });
        },
        function(cb) {
            fs.rename(projectConf.project.artifactId, 'ios', function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            cocoapods.updatePodFile(projectConf, cb);
        },
        function(cb) {
            cleanPlatformDir('ios', function(err) {
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

module.exports = createIOSProjectFromTemplate;
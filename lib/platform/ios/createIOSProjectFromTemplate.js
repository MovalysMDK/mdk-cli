'use strict';

var fs = require('fs-extra');
var async = require("async");
var assert = require("assert");
var path = require("path");

var system = require('../../utils/system');

var cleanPlatformDir = require('../common/cleanPlatformDir');
var devToolsSpecs = require('../../devtools/specs');

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

    //TODO: specify settings.xml to use
    //TODO: specify JAVA_HOME

    var createProjectArgs = [
          '-B',
          'archetype:generate',
          '-DarchetypeGroupId=com.sopragroup.adeuza.movalysfwk',
          '-DarchetypeArtifactId=mdk-ios-project-template',
          '-DarchetypeVersion=' + projectConf.project.mdkVersion,
          '-DarchetypeRepository=https://artifactory.movalys.sopra.com/artifactory/prj-mdk-releases',
          '-DgroupId=' + projectConf.project.groupId + '.ios',
          '-DartifactId=' + projectConf.project.artifactId,
          '-Dversion=' + projectConf.project.version,
          '-DapplicationName=' + projectConf.project.artifactId,
          '-DadjavaDebug=' + projectConf.options.adjavaDebug,
          '-DxmiFile=../commons/modelisation.xml'
        ].concat(projectConf.options.mavenOptions);

    async.waterfall([
        function(cb) {
            devToolsSpecs.getToolInstallDir(toolSpecs, "apache-maven", osName, "ios", function (err, installDir) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, path.join(installDir, "bin", "mvn"));
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
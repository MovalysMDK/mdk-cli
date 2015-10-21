'use strict';

var assert = require('assert');
var path = require('path');

var getInstallDir = require('./getInstallDir');
var getSettingsXmlFile = require('./getSettingsXmlFile');
var envVars = require("../../../utils/system/envVars");

/**
 * Display environment for maven
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function displayEnv(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, osName, platform, function(err, installDir) {
        if (err ) {
            callback(err);
        }
        else {
            var settingsFile = getSettingsXmlFile();

            console.log(envVars.computeDefinition("M2_HOME", installDir, osName));
            console.log(envVars.computeAppendToPath(path.join(installDir, "bin"), osName));
            if (osName === "win") {
                console.log("doskey mvn=mvn -s \"" + settingsFile + "\"");
            }
            else if (osName === "osx") {
                console.log("alias mvn='mvn -s \"" + settingsFile + "\"'");
            }
            callback();
        }
    });
}

module.exports = displayEnv;
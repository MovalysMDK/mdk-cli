'use strict';

var assert = require('assert')
var path = require('path');

var getInstallDir = require('./getInstallDir');
var getSettingsXmlFile = require('./getSettingsXmlFile');

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

            console.log("export M2_HOME=" + installDir);
            console.log("export PATH=" + path.join(installDir, "bin") + ":$PATH");
            console.log("alias mvn='mvn -s \"" + settingsFile + "\"'");
            callback();
        }
    });
}

module.exports = displayEnv;
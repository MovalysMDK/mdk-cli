'use strict';

var assert = require('assert');

var getSettingsXmlFile = require('./getSettingsXmlFile');
var getInstallDir = require('./getInstallDir');

/**
 * Define environment for maven.
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function defineEnv(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, osName, platform, function(err, installDir) {
        if (err ) {
            callback(err);
        }
        else {
            process.env.M2_HOME = installDir;
            //process.env.M2_OPTS = ""
            callback();
        }
    });
}

module.exports = defineEnv;
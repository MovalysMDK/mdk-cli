'use strict';

var assert = require('assert');
var path = require('path');

var getGemHome = require('./getGemHome');
var getInstallDir = require('./getInstallDir');
var envVars = require("../../../utils/system/envVars");

/**
 * Get environment variables for GEMS
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function getEnv(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');
    
    getGemHome(toolSpecs, function(err, gemHome) {
        if (err ) {
            callback(err);
        }
        else {
            getInstallDir(toolSpecs, function(err, gemHome) {
                if (err ) {
                    callback(err);
                }
                else {
                    var env = [
                        envVars.computeDefinition("GEM_HOME", path.join(gemHome, 'lib'), osName)
                    ];
                    var pathvar = [
                        path.join(gemHome, "bin")
                    ];
                    return callback(null, env, pathvar);
                }
            });
        }
    });

}

module.exports = getEnv;
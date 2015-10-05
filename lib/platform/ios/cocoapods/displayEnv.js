'use strict';

var assert = require('assert')
var path = require('path');

var getGemHome = require('./getGemHome');
var getInstallDir = require('./getInstallDir');

/**
 * Display environment for cocoapods
 * @param toolsSpec tools specification
 * @param callback callback
 */
function defineEnv(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
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
                    if ( typeof process.env.GEM_HOME == 'undefined' || process.env.GEM_HOME !== gemHome ) {
                        process.env.GEM_HOME = gemHome;
                        console.log("export GEM_HOME=" + path.join(gemHome, "lib"));
                        console.log("export PATH=" + path.join(gemHome, "bin") + ":$PATH");
                    }
                    callback();
                }
            });
        }
    });
}

module.exports = defineEnv;
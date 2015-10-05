'use strict';

var assert = require('assert');
var path = require('path');

var getGemHome = require('./getGemHome');

/**
 * Create environment for maven
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
            process.env.PATH = path.join(gemHome, "bin") + ":" + process.env.PATH;
            process.env.GEM_HOME = gemHome;
            callback();
        }
    });
}

module.exports = defineEnv;
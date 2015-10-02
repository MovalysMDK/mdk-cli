'use strict';

var assert = require('assert');

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
            process.env.GEM_HOME = gemHome;
            callback();
        }
    });
}

module.exports = defineEnv;
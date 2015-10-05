'use strict';

var assert = require('assert');
var path = require('path');

var getInstallDir = require('./getInstallDir');

/**
 * Create environment for uncrustify
 * @param toolsSpec tools specification
 * @param callback callback
 */
function defineEnv(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, function(err, installDir) {
        if (err ) {
            callback(err);
        }
        else {
            process.env.PATH = path.join(installDir, "bin") + ":" + process.env.PATH;
            callback();
        }
    });
}

module.exports = defineEnv;
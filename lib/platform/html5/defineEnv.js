'use strict';

var assert = require('assert');
var async = require('async');

var jdk = require('../common/jdk');
var maven = require('../common/maven');

/**
 * Define required shell environment for mdk.
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function defineEnv( devToolsSpecs, osName, callback ) {

    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall([
        function(cb) {
            jdk.defineEnv(devToolsSpecs, osName, "html5", cb);
        },
        function(cb) {
            maven.defineEnv(devToolsSpecs, osName, "html5", cb);
        }
    ],
    function(err) {
        callback(err);
    });
}

module.exports = defineEnv;
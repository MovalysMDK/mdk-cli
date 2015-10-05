'use strict';

var assert = require('assert');
var async = require('async');

var jdk = require('../common/jdk');
var maven = require('../common/maven');
var cocoapods = require('./cocoapods');
var xctool = require('./xctool');
var xcproj = require('./xcproj');
var doxygen = require('./doxygen');
var uncrustify = require('./uncrustify');
var gems = require('./gems');

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
                jdk.defineEnv(devToolsSpecs, osName, "ios", cb);
            },
            function(cb) {
                maven.defineEnv(devToolsSpecs, osName, "ios", cb);
            },
            function(cb) {
                gems.defineEnv(devToolsSpecs, cb);
            },
            function(cb) {
                xctool.defineEnv(devToolsSpecs, cb);
            },
            function(cb) {
                doxygen.defineEnv(devToolsSpecs, cb);
            },
            function(cb) {
                uncrustify.defineEnv(devToolsSpecs, cb);
            }
        ],
        function(err) {
            callback(err);
        });
}

module.exports = defineEnv;
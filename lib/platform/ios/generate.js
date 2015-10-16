'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');

var xctool = require('./xctool');
var unlockKeyChains = require('../common/unlockKeyChains');
var cocoapods = require('./cocoapods');
var adjava = require('../common/adjava');

/**
 * Generate ios platform.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function generate( projectConf, devToolsSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function(cb) {
            fs.access("ios", fs.R_OK, function (err) {
                if (err) {
                    cb('platform ios does not exists.');
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            console.log('  start generation');
            adjava.generate(projectConf, devToolsSpecs, osName, "ios", function (err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        }
    ], function(err) {
        callback(err);
    });
}

module.exports = generate;
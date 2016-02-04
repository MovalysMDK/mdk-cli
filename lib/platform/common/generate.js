'use strict';

var assert = require('assert');
var async = require('async');

var adjava = require('./adjava/index');

/**
 * Generate project.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param platformName The platform to generate
 * @param callback callback
 */
function generate( projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall([
        function(cb) {
            adjava.generate(projectConf, toolSpecs, osName, projectConf.platformName, function (err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        }
    ],
    function(err, results) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = generate;
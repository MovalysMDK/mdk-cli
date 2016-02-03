'use strict';

var assert = require('assert');
var async = require('async');

var generate = require('../common/generate');
var compile = require('./compile');

/**
 * Build android project.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function build( projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall([
        function(cb) {
            console.log('  start generation');
            generate(projectConf, toolSpecs, osName, function (err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            console.log('  HTML5 build');
            compile(projectConf, toolSpecs, osName, cb);
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

module.exports = build;
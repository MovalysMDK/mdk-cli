'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');

var xctool = require('./xctool');
var unlockKeyChains = require('../common/unlockKeyChains');
var displayMessagesVersion = require('../common/displayMessagesVersion');
var defineEnv= require('./defineEnv');

/**
 * Build ios platform.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function build( projectConf, devToolsSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function(cb) {
            displayMessagesVersion(projectConf.project.mdkVersion, cb);
        },
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
            // Unlock keychains is needed

            console.log("  unlock keychains");

            unlockKeyChains(projectConf, function(err, result) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            defineEnv(devToolsSpecs, osName, cb);
        },
        function(cb) {
            var clean = true;
            // Build project using xctool
            process.chdir('ios');

            console.log("  build project with xctool");

            xctool.build(projectConf, clean, devToolsSpecs, function(err, results) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                    // run tests
                    /*if ( runTest ) {
                     xctoolTest(conf, updateCache, function (err, results) {
                     if (err) {
                     callback(err);
                     } else {
                     callback();
                     }
                     });
                     } else {
                     callback();
                     }*/
                }
            });
        }
    ], function(err) {
        callback(err);
    });
}

module.exports = build;
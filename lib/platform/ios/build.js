'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');

var xctool = require('./xctool');
var unlockKeyChains = require('../common/unlockKeyChains');
var cocoapods = require('./cocoapods');
var generate = require('../common/generate');

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
            fs.access("ios", fs.R_OK, function (err) {
                if (err) {
                    cb('platform ios does not exists.');
                }
                else {
                    cb();
                }
            });
        },
        /*function(cb) {
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
        },*/
        function(cb) {
            cocoapods.needPodUpdate(function(err, doPodUpdate) {
                if (err) {
                    cb(err);
                }
                else {
                    if (doPodUpdate) {
                        console.log("  pod update");
                        cocoapods.podUpdate(projectConf, devToolsSpecs, cb);
                    }
                    else {
                        console.log("  ignore 'pod update' (delete Podfile.lock to force)");
                        cb();
                    }
                }
            });
        },
        function(cb) {
            console.log('  start generation');
            generate(projectConf, devToolsSpecs, osName, function (err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
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
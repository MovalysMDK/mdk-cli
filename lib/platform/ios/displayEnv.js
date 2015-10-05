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
var displayMessagesVersion = require('../common/displayMessagesVersion');

/**
 * Display required shell environment for mdk.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function displayEnv( projectConf, devToolsSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof callback, 'function');

    async.waterfall([
            function(cb) {
                displayMessagesVersion(projectConf.project.mdkVersion, cb);
            },
            function(cb) {
                jdk.displayEnv(devToolsSpecs, osName, "ios", cb);
            },
            function(cb) {
                maven.displayEnv(devToolsSpecs, osName, "ios", cb);
            },
            function(cb) {
                gems.displayEnv(devToolsSpecs, cb);
            },
            function(cb) {
                xctool.displayEnv(devToolsSpecs, cb);
            },
            function(cb) {
                doxygen.displayEnv(devToolsSpecs, cb);
            },
            function(cb) {
                uncrustify.displayEnv(devToolsSpecs, cb);
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

module.exports = displayEnv;
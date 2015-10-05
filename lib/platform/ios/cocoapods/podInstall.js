'use strict';

var fs = require('fs-extra');
var assert = require('assert');
var async = require('async');
var path = require('path');

var system = require('../../../utils/system');
var getPodCmd = require('./getPodCmd');
var netrc = require('../../common/netrc');

/**
 * Run pod install inside project
 * @param projectConf project configuration
 * @param toolSpecs tools specification
 * @param callback callback
 */
function podInstall(projectConf, toolSpecs, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    process.chdir('ios');

    async.waterfall([
        function(cb) {
            netrc.create("osx", cb);
        },
        function(cb) {
            getPodCmd(toolSpecs, cb);
        },
        function(podCmd, cb) {
            var args = ['install'].concat(projectConf.options.cocoapodOptions);
            system.spawn( podCmd, args, function( err, stdout, stder ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        }
    ],
    function(err) {
        // restore .netrc file
        netrc.restore("osx", function(err2) {
            process.chdir('..');
            callback(err);
        });
    });
}


module.exports = podInstall ;
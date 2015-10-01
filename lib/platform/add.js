'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var clc = require('cli-color');

var androidPlatform = require('./android');
var iosPlatform = require('./ios');

var devToolsSpecs = require('../devtools/specs');
var checkPlatform = require('../devtools/check/common/checkPlatform');
var osName = require('../utils/system/osName');
var projectConfig = require('../project/config');

/**
 * Add platform to the project.
 * @param platformName platform
 * @param callback callback
 */
function add( platformName, callback ) {

    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    console.log("Add platform " + clc.bold(platformName));
    console.log("");

    async.waterfall( [
        function(cb) {
            // check platform is compatible with current os.
            checkPlatform(platformName, function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            // check is "platformName" directory already exists
            fs.access(platformName, fs.R_OK, function(err) {
                if (!err) {
                    cb('platform ' + platformName + ' already exists.');
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            projectConfig.read( function( err, projectConf ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb(null, projectConf);
                }
            });
        },
        function(projectConf, cb) {
            // retrieve devTools specification.
            devToolsSpecs.get(projectConf.project.mdkVersion, false, function(err, devToolsSpec) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, projectConf, devToolsSpec);
                }
            });
        },
        function(projectConf, devToolsSpecs, cb) {
            // retrieve os name
            osName( function(err, name ) {
                cb(err,projectConf, devToolsSpecs, name);
            });
        },
        function(projectConf, devToolsSpecs, osName, cb) {

            switch(platformName) {
                case 'android':
                    androidPlatform.add(projectConf, devToolsSpecs, cb);
                    break;
                case 'ios':
                    iosPlatform.add(projectConf, devToolsSpecs, osName, cb);
                    break;
                default:
                    cb('Unkown platform: ' + platformName);
                    break;
            }
        }
    ], function(err) {
        callback(err);
    });
}

module.exports = add;
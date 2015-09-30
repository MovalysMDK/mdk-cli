'use strict';

var assert = require('assert');
var async = require('async');

var androidPlatform = require('./android');
var iosPlatform = require('./ios');

var devToolsSpecs = require('../devtools/specs');
var checkPlatform = require('../devtools/check/common/checkPlatform');
var osName = require('../utils/system/osName');

/**
 * Add platform to the project.
 * @param platformName platform
 * @param callback callback
 */
function add( platformName, callback ) {

    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // compute os name.
            osName( function(err, name ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb(null, name);
                }
            });
        },
        function(osName, cb) {
            // check platform is compatible with current os.
            checkPlatform(platformName, function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, osName);
                }
            });
        }/*,
        function(osName, cb) {
            // retrieve devTools specification.
            devToolsSpecs.get(mdkVersion, false, function(err, devToolsSpec) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, devToolsSpec, osName);
                }
            });
        },
        function(devToolsSpecs, osName, cb) {

            switch(platformName) {
                case 'android':
                    androidPlatform.add(callback);
                    break;
                case 'ios':
                    iosPlatform.add(callback);
                    break;
                default:
                    callback('Unkown platform: ' + platformName);
                    break;
            }
        }*/
    ], function(err) {
        callback(err);
    });
}

module.exports = add;
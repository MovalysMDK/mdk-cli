'use strict';

var fs = require('fs-extra');
var async = require('async');
var glob = require("glob");
var path = require('path');
var assert = require('assert');

/**
 * Clean platform: remove unused files.
 * @param platformName platform name
 * @param callback callback
 */
function cleanPlatformDir(platformName, callback) {

    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall([
        function (cb) {
            // Remove tools directory
            fs.remove(path.join(platformName, 'tools'), function(err) {
                if ( err ){
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function (cb) {
            // Remove docs directory
            fs.remove(path.join(platformName, 'docs'), function(err) {
                if ( err ){
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function (cb) {
            // Remove all delete-safely files
            glob(platformName + "/**/delete-safely*.txt", {}, function (err, files) {
                if ( err ) {
                    cb(err);
                }
                else {
                    async.eachSeries(files, fs.unlink, function(err) {
                        if (err) {
                            cb();
                        }
                        else {
                            cb(err);
                        }
                    });
                }
            });
        }
    ],
    function(err) {
        if ( err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = cleanPlatformDir;
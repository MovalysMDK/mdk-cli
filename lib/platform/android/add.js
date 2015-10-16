'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');

var createAndroidProjectFromTemplate = require('./createAndroidProjectFromTemplate');
var generate = require('../common/generate');

/**
 * Add android platform to the project.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function add( projectConf, devToolsSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    var inconsistentFile = path.join("android", ".inconsistent");

    async.waterfall([
        function(cb) {
            // check if android directory already exists
            fs.access("android", fs.R_OK, function(err) {
                if (!err) {
                    // check if ".inconsistent" file  exists.
                    // If the file exists, it means a previous add command has failed and that we can remove the directory before retrying.
                    fs.access(inconsistentFile, fs.R_OK, function(err) {
                        if (!err) {
                            fs.remove("android", function (err) {
                                if (err) {
                                    cb(err);
                                }
                                else {
                                    cb();
                                }
                            });
                        }
                        else {
                            cb('platform android already exists.');
                        }
                    });
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            // Create project from template
            console.log('  create android project from template');
            createAndroidProjectFromTemplate(projectConf, devToolsSpecs, osName, function(err) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            // Create inconsistent file
            fs.ensureFile(inconsistentFile, cb);
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
        }
    ],
    function(err, results) {
        if (err) {
            callback(err);
        }
        else {
            //platform-add success, we can remove the inconsistent file.
            fs.remove(inconsistentFile, callback);
        }
    });
}

module.exports = add;
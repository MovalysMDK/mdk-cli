'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');

var createIOSProjectFromTemplate = require('./createIOSProjectFromTemplate');
var genere = require('./genere');
var jdk = require('../common/jdk');
var maven = require('../common/maven');
var cocoapods = require('./cocoapods');

/**
 * Add ios platform to the project.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function add( projectConf, devToolsSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof callback, 'function');

    var inconsistentFile = path.join("ios", ".inconsistent");

    async.waterfall([
        function(cb) {
            // check if ios directory already exists
            fs.access("ios", fs.R_OK, function(err) {
                if (!err) {
                    // check if ".inconsistent" file  exists.
                    // If the file exists, it means a previous add command has failed and that we can remove the directory before retrying.
                    fs.access(inconsistentFile, fs.R_OK, function(err) {
                        if (!err) {
                            fs.remove("ios", function (err) {
                                if (err) {
                                    cb(err);
                                }
                                else {
                                    cb();
                                }
                            });
                        }
                        else {
                            cb('platform ios already exists.');
                        }
                    });
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            // define jdk env (JAVA_HOME)
            jdk.defineEnv(devToolsSpecs, osName, "ios", cb);
        },
        function(cb) {
            // define maven env (M2_HOME, M2_OPTS)
            maven.defineEnv(devToolsSpecs, osName, "ios", cb);
        },
        function(cb) {
            cocoapods.defineEnv(devToolsSpecs, cb);
        },
        function(cb) {
            // Create project from template
            console.log('  create ios project from template');
            createIOSProjectFromTemplate(projectConf, devToolsSpecs, osName, function(err) {
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
            console.log('  pod install');
            cocoapods.podInstall(projectConf, devToolsSpecs, function(err) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            console.log('  start generation');
            genere(projectConf, devToolsSpecs, osName, function(err) {
                if ( err) {
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
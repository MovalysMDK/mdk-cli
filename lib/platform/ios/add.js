'use strict';

var assert = require('assert');
var async = require('async');

var createIOSProjectFromTemplate = require('./createIOSProjectFromTemplate');
var podInstall = require('./podInstall');
var genere = require('./genere');

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

    async.waterfall([
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
            console.log('  pod install');
            podInstall(projectConf, devToolsSpecs, osName, function(err) {
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
            callback();
        }
    });
}

module.exports = add;
'use strict';

var fs = require('fs-extra');
var assert = require('assert');
var async = require('async');
var path = require('path');

var system = require('../../utils/system');
var devToolsSpecs = require('../../devtools/specs');

/**
 * Run pod install inside project
 * @param projectConf project configuration
 * @param toolSpecs tools specification
 * @param osName os name
 * @param callback callback
 */
function podInstall(projectConf, toolSpecs, osName, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    var cmd = 'pod';
    var args = ['install'].concat(projectConf.options.cocoapodOptions);
    process.chdir('ios');

    async.waterfall([
        function(cb) {
            devToolsSpecs.getToolInstallDir(toolSpecs, "cocoapods", osName, "ios", function (err, installDir) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, installDir);
                }
            });
        },
        function( installDir, cb) {
            var podCmd = path.join(installDir, "bin", "pod");
            var gemHome = path.join(installDir, "lib");
            process.env.GEM_HOME = gemHome;

            system.spawn( podCmd, args, function( err, stdout, stder ) {

                process.chdir('..');

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
        callback(err);
    });


}


module.exports = podInstall ;
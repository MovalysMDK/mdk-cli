'use strict';

var assert = require('assert');
var async = require('async');
var path = require('path');

var system = require('../../utils/system');
var devToolsSpecs = require('../../devtools/specs');

/**
 * Generate source code of application.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function genere( projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    // enter ios directory
    process.chdir('ios');

    //TODO: specify settings.xml to use
    //TODO: specify JAVA_HOME
    //TODO: PATH to mfxcode

    // genere
    var args = projectConf.options.mavenOptions.concat(['generate-sources']);

    async.waterfall([
        function(cb) {
            devToolsSpecs.getToolInstallDir(toolSpecs, "apache-maven", osName, "ios", function (err, installDir) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, path.join(installDir, "bin", "mvn"));
                }
            });
        },
        function ( mvnCmd, cb) {
            system.spawn(mvnCmd, args, function(err, stdout ) {
                process.chdir('..');
                if ( err ) {
                    cb('build failed: ' + err );
                }
                else {
                    // exit ios directory
                    cb();
                }
            });
        }
    ],
    function(err) {
        callback(err);
    });
}

module.exports = genere ;
'use strict';

var assert = require('assert');
var async = require('async');
var path = require('path');

var system = require('../../../utils/system');
var maven = require('../maven');

/**
 * Generate source code of application.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param platform platform
 * @param callback callback
 */
function generate( projectConf, toolSpecs, osName, platform, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    // enter ios directory
    process.chdir(platform);
    
    // genere
    var generateSourcesArgs = [
        '-s',
        maven.getSettingsXmlFile(),
        "generate-sources"
    ];

    generateSourcesArgs.concat(projectConf.options.mavenOptions.concat(['generate-sources']));

    async.waterfall([
        function(cb) {
            maven.getMvnCmd(toolSpecs, osName, platform, function (err, mvnCmd) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, mvnCmd);
                }
            });
        },
        function ( mvnCmd, cb) {
            system.spawn(mvnCmd, generateSourcesArgs, function(err, stdout ) {
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
        process.chdir('..');
        callback(err);
    });
}

module.exports = generate ;
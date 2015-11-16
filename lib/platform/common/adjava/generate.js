'use strict';

var assert = require('assert');
var async = require('async');
var path = require('path');
var clc = require('cli-color');
var fs = require('fs-extra');


var system = require('../../../utils/system');
var mkdLog = require('../../../utils/log');
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
                        cb(null, err);
                    }
                    else {
                        cb(null, null);
                    }
                });
            },
            function(adjavaErr, cb) {
                var adjavaMessagesFile = path.join('adjavaMessages.json');
                fs.readJson(adjavaMessagesFile, function(adjavaErr, messages) {
                    if(adjavaErr) {
                        cb(null, null, adjavaErr);
                    }
                    else {
                        cb(null, messages, null);
                    }
                });
            },
            function (messages, adjavaErr, cb) {
                var hasError = false;
                if((messages !== null) && (typeof messages != 'undefined') && (messages.length >  0)) {
                    console.log();
                    mkdLog.separator();
                    console.log(clc.bold.underline('MDK AGL messages:'));
                    messages.forEach(function (message) {
                        var level;
                        if (message.severity === "WARN") {
                            level = clc.yellow.bold('[WARNING] ');
                        }
                        else if (message.severity === "ERROR") {
                            level = clc.red.bold('[ERROR] ');
                            hasError = true;
                        }
                        else if (message.severity === "INFO") {
                            level = clc.green.bold('[INFO] ');
                        }
                        console.log(level + message.message);
                    });
                    mkdLog.separator();
                    console.log();
                }
                if(hasError) {
                    cb(clc.red.bold('Please check the messages above.'));
                }
                else {
                    cb(null, adjavaErr);
                }
            },
            function(adjavaErr, cb) {
                if(!adjavaErr || typeof adjavaErr === 'undefined' || adjavaErr.length === 0) {
                    cb();
                }
                else {
                    cb(clc.red.bold('MDK AGL : generation failed :\n'), adjavaErr);
                }
            }
        ],
        function(err) {
            process.chdir('..');
            callback(err);
        });
}

module.exports = generate ;
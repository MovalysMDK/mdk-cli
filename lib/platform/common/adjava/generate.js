/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var process = require('process');
var assert = require('assert');
var async = require('async');
var path = require('path');
var clc = require('cli-color');
var fs = require('fs-extra');
var Transform = require('stream').Transform;
var spawn = require('child_process').spawn;
var PassThrough = require('stream').PassThrough;

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

    // enter os directory
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
				
				var adjava;
				var adjavaErrorsFileName = "./adjava-error.txt";
				var stackToFile = fs.createWriteStream(adjavaErrorsFileName);
<<<<<<< HEAD
                stackToFile.on('open',function(err) {
                    if ( /^win/.test(process.platform) ){
                        adjava = spawn(mvnCmd + ".cmd", generateSourcesArgs, {
                            stdio: ['pipe',stackToFile, stackToFile]
                        });
                    }else{
                        adjava = spawn(mvnCmd, generateSourcesArgs, {
                            stdio: ['pipe',stackToFile, stackToFile]
                        });
                    }
                    
                    // Print the Maven stack trace in error file in case of errors
                    // adjava.stdout.pipe(stackToFile);
                    // adjava.stderr.pipe(stackToFile);
                    
                    adjava.on('error', function(e){
                        return cb(e);
                    });
                    
                    adjava.on('close', function(code){
                        if (code === 0){
                            stackToFile.end();
                            fs.unlinkSync(adjavaErrorsFileName);
                            return cb(null, null);
                        }else{
                            return cb("Check " + platform + "/adjava-error.txt for details");
                        }
                    });
                });	
=======
				
				if ( /^win/.test(process.platform) ){
					adjava = spawn(mvnCmd + ".cmd", generateSourcesArgs);
				}else{
					adjava = spawn(mvnCmd, generateSourcesArgs);
				}
				
				// Print the Maven stack trace in error file in case of errors
        var parseErrors = new Transform();
        parseErrors._transform = function(data, encoding, done) {
            if (data.toString('utf8').startsWith("[ERROR]")) {
              this.push(data);
            }
            done();
        };
        
        var multiplexForStdout = new PassThrough();
				multiplexForStdout.pipe(stackToFile);
				multiplexForStdout.pipe(parseErrors).pipe(process.stderr);
				adjava.stdout.pipe(multiplexForStdout);
        
        // Errors and errors logs go in file and to stderr
        var multiplexForStdErr = new PassThrough;
				multiplexForStdErr.pipe(stackToFile);
				multiplexForStdErr.pipe(process.stderr);
				adjava.stderr.pipe(multiplexForStdErr);
        
				adjava.on('error', function(e){
					return cb(e);
				});
				
				adjava.on('close', function(code){
					if (code === 0){
						stackToFile.end();
						fs.unlinkSync(adjavaErrorsFileName);
						return cb(null, null);
					}else{
						return cb("Check " + platform + "/adjava-error.txt for details");
					}
				});
>>>>>>> cdca51441dfe24bf238acd30aeb075471ccfbd68
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
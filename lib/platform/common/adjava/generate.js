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
                
                stackToFile.on('open',function(err) {
                    computeCommand(mvnCmd,generateSourcesArgs,function(err,command,params){
                        adjava = spawn(command, params, {
                            stdio: ['pipe',stackToFile, stackToFile]//,'pipe','pipe']
                        });
                        
                        adjava.on('error', function(e){
                            return cb(e);
                        });
                        
                        adjava.on('exit', function(code){
                            if (code === 0){
                                stackToFile.end();
                                // fs.unlinkSync(adjavaErrorsFileName);
                                return cb(null, null);
                            }else{
                                return cb(null, "Check " + platform + "/adjava-error.txt for details");
                            }
                        });
                    });
                });
            },
            function(adjavaErr, cb) {
                if(!adjavaErr || typeof adjavaErr === 'undefined' || adjavaErr.length === 0) {
                    cb();
                }
                else {
                    cb(clc.red.bold('MDK AGL : generation failed :\n')+ adjavaErr);
                }
            }
        ],
        function(err) {
            process.chdir('..');
            callback(err);
        });
}


function computeCommand(command,params,callback) {
    var isWin = /^win/.test(process.platform);
    if ( isWin) {
        fs.access(command+'.bat',fs.F_OK,function(err) {
            if (err) {
                params = ['/c', command].concat(params);
                command = 'cmd';
                return callback(null, command,params);
            }
            else {
                params = ['/c', command+'.bat'].concat(params);                
                command = 'cmd';
                return callback(null, command,params);
            }
        });
    }
    else {
        return callback(null,command,params);
    }
}


module.exports = generate ;
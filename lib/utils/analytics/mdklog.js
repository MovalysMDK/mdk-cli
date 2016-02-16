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

var mdkpath = require('../../mdkpath');
var fs = require('fs');
var path = require('path');
var config = require('../../config');
var async = require('async');
var findProxy = require('../network/findProxy');
var fork = require('child_process').fork;

function mdklog(command, callback) {
    
    config.get('mdk_analytics_enabled', function(err, res) {
        if (err) {
            return callback();
        }
        if (res === "true")
        {
            var logDir = path.join(mdkpath().homeDir,'analytics');
            fs.access(logDir, fs.F_OK, function(err) {
                if (err) {
                    fs.mkdirSync(logDir);
                }
            });
            var log = {};
            var d = new Date();
            log.time = d.getTime();
            log.command = command;
            
            var logFileName = path.join(logDir,d.getDate() +'_'+ d.getMonth() +'_'+ d.getFullYear() + '-' + 
                                        d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds() + '.json');

            config.get("mdk_login", function(err, username ) {
                if (err) {
                    // Do nothing
                }
                else {
                    // write to the disk the logged activity
                    log.user = username;
                    fs.writeFileSync(logFileName,JSON.stringify(log));
                    
                    findProxy(function(err, proxy) {
                        if (err ||!res) {
                            return callback();
                        }
                        config.get("mdkAnalyticsUrl", function(err, mdkAnalyticsUrl ) {
                            var args = [mdkAnalyticsUrl];
                            if (proxy) {
                                args.push(proxy);
                            }
                            
                            var child = fork(__dirname + '/sendLog', args,{
                                cwd:logDir,
                                stdio:[null,null,null],
                                detached: true,
                                execArgv: ['--debug=5860']}
                            );
                            child.unref();

                            child.on('disconnect', function() {
                                return callback();
                            });
                            child.disconnect(); 
                        });
                    });
                }
            });
        }
        else {
            return callback();
        }
    });
}

module.exports = mdklog;

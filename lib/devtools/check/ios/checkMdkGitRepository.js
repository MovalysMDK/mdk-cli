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
"use strict";


var clc = require('cli-color');
var async = require("async");
var http = require('http');

var user = require('../../../user');
var system = require('../../../utils/system');
var network = require('../../../utils/network');
var config = require('../../../config');
var mdkLog = require('../../../utils/log');

module.exports = {

    /**
     * Check if require is ok.
     * @param checkSpec check specification
     * @param devToolsSpec environment specification
     * @param osName osName
     * @param platform mobile platform
     * @param callback callback
     */
    check: function( checkSpec, devToolsSpec, osName, platform, callback ) {


        async.waterfall([
                function(cb) {
                    config.get('mdkRepoGit', function(err, gitUrl) {
                        if(err) {
                            cb(err);
                        }
                        else {
                            cb(null, gitUrl);
                        }
                    });
                },
                function(gitUrl, cb) {
                    user.loadCredentials(function(err, username, password) {
                        var internalMode = gitUrl.indexOf("@") > -1;
                        if(!internalMode) {
                            var options = {
                                url: gitUrl,
                                auth: {
                                    user: username,
                                    password: password
                                }
                            };
                            checkExternalGit(options, cb);
                        }
                        else {
                            system.spawn('git', ['ls-remote', '-h', gitUrl+"mfcore.git" ], function(err, result) {
                                if(err) {
                                    mdkLog.ko("MDK Git repository", "Access failure : " + result);
                                    cb(err);
                                }
                                else {
                                    if(result.indexOf("FATAL:") > -1) {
                                        mdkLog.ko("MDK Git repository", "Access failure : " + result);
                                        cb(result);
                                    }
                                    else {
                                        mdkLog.ok("MDK Git Repository", "Access success");
                                        cb();
                                    }
                                }
                            });
                        }

                    });
                }
            ], function(err) {
                if (err) {
                    callback(false);
                }
                else {
                    callback(true);
                }

            }
        );
    }
};


function checkExternalGit(options, callback) {
    network.downloadContent(options, function(err, result) {
        if ( err) {
            mdkLog.ko("MDK Git repository", "Access failure : " + result);
            callback(err);
        }
        else {
            mdkLog.ok("MDK Git Repository", "Access success");
            callback();
        }
    });
}

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

var clc = require ('cli-color');
var async = require("async");
var path = require("path");
var fs = require("fs-extra");

var system = require('../../../utils/system');
var config = require('../../../config');
var network = require('../../../utils/network');
var user = require('../../../user');
var maven = require('../../../platform/common/maven');
var mdkPath = require('../../../mdkPath');
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
    check: function (checkSpec, devToolsSpec, osName, platform, callback) {

        async.waterfall([
                function(cb) {
                    maven.getMvnCmd(devToolsSpec, osName, "ios", function (err, mvnCmd) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null, mvnCmd);
                        }
                    });
                },
                function(mvnCmd, cb) {
                    config.get('mdkRepoRelease', function(err, artifactoryUrl) {
                        if(err) {
                            cb(err);
                        }
                        else {
                            cb(null, mvnCmd, artifactoryUrl);
                        }
                    });
                },
                function (mvnCmd, artifactoryUrl, cb) {
                    user.loadCredentials( function(err, username, password ) {
                        cb(null, mvnCmd, artifactoryUrl, username, password);
                    });
                },
                function(mvnCmd, artifactoryUrl, username, password, cb) {
                    var jarName = "adjava-android-6.6.0.jar";
                    var options = {
                        url: artifactoryUrl + "/com/adeuza/adjava-android/6.6.0/" + jarName
                    };
                    if ( username && password ) {
                        options.auth = {
                            user: username,
                            pass: password
                        };
                    }
                    var destFile = path.join(mdkPath().tmpDir, jarName);
                    network.downloadFile(options, destFile, true, function (err) {
                        if (err) {
                            mdkLog.ko("MDK Artifactory", "Access fail");
                            cb(err);
                        }
                        else {
                            mdkLog.ok("MDK Artifactory", "Access success");
                            cb(null, destFile);
                        }
                    });
                },
                function(fileToDelete, cb) {
                    fs.remove(fileToDelete, cb);
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
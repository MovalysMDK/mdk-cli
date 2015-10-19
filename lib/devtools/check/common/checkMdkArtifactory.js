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
                    var destFile = path.join(system.userHome(), ".mdk", "tmp", jarName);
                    network.downloadFile(options, destFile, false, function (err) {
                        if (err) {
                            console.log(clc.red('[KO]') + ' fail to download an artifact from mdk artifactory. Check settings.xml is ok : ' + err);
                            cb(err);
                        }
                        else {
                            console.log(clc.green('[OK]') + ' access to mdk framework (artifactory)');
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
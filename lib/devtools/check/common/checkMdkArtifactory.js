"use strict";

var clc = require ('cli-color');
var async = require("async");

var system = require('../../../utils/system');
var config = require('../../../config');
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
                function(mvnCmd, artifactoryUrl, cb) {
                    var params = [
                        'org.apache.maven.plugins:maven-dependency-plugin:2.8:get',
                        '-DremoteRepositories='+artifactoryUrl,
                        '-Dartifact=com.adeuza:adjava-android:6.6.0',
                        '-Dmaven.wagon.http.ssl.insecure=true',
                        '-Dmaven.wagon.http.ssl.allowall=true'
                    ];
                    system.spawn(mvnCmd, params, function (err, output) {

                        if (err) {
                            console.log(clc.red('[KO]') + ' fail to download an artifact from mdk artifactory. Check settings.xml is ok : ' + err);
                            cb(err);
                        }
                        else {
                            console.log(clc.green('[OK]') + ' access to mdk framework (artifactory)');
                            cb(null);
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
}
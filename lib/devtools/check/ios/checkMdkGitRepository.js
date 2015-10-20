"use strict";


var clc = require('cli-color');
var async = require("async");
var http = require('http');

var user = require('../../../user');
var system = require('../../../utils/system');
var network = require('../../../utils/network');
var config = require('../../../config');

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
                                    console.log(clc.red('[KO] ') + clc.bold("MDK Git repository : ") + "Access failure : " + result);
                                    cb(err);
                                }
                                else {
                                    if(result.indexOf("FATAL:") > -1) {
                                        console.log(clc.red('[KO] ') + clc.bold("MDK Git repository : ") + "Access failure : " + result);
                                        cb(result);
                                    }
                                    else {
                                        console.log(clc.green('[OK] ') + clc.bold("MDK Git repository : ") + "Access success");
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
            console.log(clc.red('[KO] ') + clc.bold("MDK Git repository : ") + "Access failure : " + err);
            callback(err);
        }
        else {
            console.log(clc.green('[OK] ') + clc.bold("MDK Git repository : ") + "Access success");
            callback();
        }
    });
}

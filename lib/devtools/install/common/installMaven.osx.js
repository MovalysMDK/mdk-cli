"use strict"

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var zlib = require('zlib');
var child_process = require('child_process');

var system = require('../../../utils/system');
var config = require('../../../config');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec toolSpec
     * @param callback callback
     */
    check: function( toolSpec, callback ) {

        config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir) {
            if (typeof installDir === 'undefined') {
                callback(false);
            }
            else {
                var mavenFile = path.join(installDir, "bin", "mvn");

                async.series( [
                    function (cb) {
                        //console.log("  check directory exists");
                        // check directory is present
                        fs.access(installDir, fs.F_OK | fs.R_OK, function(err) {
                            if ( err ) {
                                console.log("    err: directory does not exists: " + installDir);
                                cb(err);
                            }
                            else cb();
                        });
                    },
                    function (cb) {
                        //console.log("  check executable java");
                        // check file java is present and execute

                        fs.access(mavenFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                            if ( err ) {
                                console.log("    err: file does not exists or is not executable : " + mavenFile);
                                cb(err);
                            }
                            else cb();
                        });
                    },
                    function (cb) {
                        // check java version
                        //fs.access(installDir, fs.F_OK | fs.R_OK | fs.X_OK, cb);
                        //console.log("  check java version");
                        var index = toolSpec.version.lastIndexOf('.');
                        var version = toolSpec.version.substr(0, index) + '_' + toolSpec.version.substr(index+1);

                        require('./installMaven.osx').checkMavenVersion( version,mavenFile, function(err) {
                            if (err) {
                                console.log("    " + err);
                                cb(err);
                            }
                            else cb();
                        });
                    }
                ], function(err) {
                    if ( err ) {
                        // if error, must reinstall
                        callback(false);
                    }
                    else {
                        // all checks passed, don't need to reinstall
                        callback(true);
                    }
                });
            }
        });
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>delete old directory if exists</li>
     *     <li>install products in directory config.get("devToolsBaseDir") + toolName + toolVersion.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param callback callback
     */
    install: function( toolSpec, callback) {

        var installDir = toolSpec.opts.installDir;
        var zipFilename = toolSpec.packages[0].filename;
        var zipFile = toolSpec.packages[0].cacheFile;


        async.waterfall([
            function(cb) {
                process.chdir(toolSpec.opts.workDir);
                console.log("  extract zip: " + zipFile);
                system.spawn('unzip', [zipFile,'-d', toolSpec.name +'-'+ toolSpec.version], function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                process.chdir("Contents");
                console.log("  copy common");
                fs.copy(toolSpec.name +'-'+ toolSpec.version, installDir, function (err) {
                    process.chdir(path.join("..",".."));
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                console.log("  remove file: " + zipFilename);
                fs.remove(zipFilename, cb);
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }

        ], function(err) {
            callback(err);
        });
    },


    checkJavaVersion: function checkMavenVersion( requiredVersion, mavenBin, callback ) {

        var spawn = child_process.spawn(mavenBin, ['--version']);
        var output = '' ;

        spawn.on('error', function(err) {
            callback('maven command failed');
        });

        spawn.stderr.on('data', function(data) {
            output += data;
        });

        spawn.on('close', function (code) {
            output = output.toString().split('\n')[0];
            var mavenVersion = new RegExp('Apache Maven').test(output) ? output.split(' ')[2].replace(/"/g, '') : false;
            if (mavenVersion != false) {

                if ( mavenVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                    callback(null, javaVersion);
                }
                else {
                    callback('bad maven version: ' + mavenVersion + '. Required version is : ' + requiredVersion);
                }
            } else {
                callback('maven command failed');
            }
        });
    }
};
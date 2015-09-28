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
            if ( err ) {
                callback(err);
            }
            else {

                var javaFile = path.join(installDir, "bin", "java");

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

                        fs.access(javaFile, fs.F_OK | fs.R_OK | fs.X_OK, function(err) {
                            if ( err ) {
                                console.log("    err: file does not exists or is not executable : " + javaFile);
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

                        require('./installJdk.osx').checkJavaVersion( version,javaFile, function(err) {
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
        var dmgFile = toolSpec.packages[0];
        var mountPath = toolSpec.packages[0].opts.osxVolumePath;
        var extractedPkgDir = toolSpec.packages[0].opts.extractedPkgDir;
        var pkgFilename = mountPath.substring(mountPath.lastIndexOf('/'))+ '.pkg';
        var pkgFile = path.join(toolSpec.packages[0].opts.osxVolumePath, pkgFilename);

        async.waterfall([
            function(cb) {
                console.log("  mount dmg file: " + dmgFile.cacheFile);
                system.spawn('hdiutil', ['attach', dmgFile.cacheFile], function (err ) {
                    cb(err);
                });
            },
            function(cb) {
                process.chdir(toolSpec.opts.workDir);
                console.log("  extract pkg: " + pkgFile);
                system.spawn('xar', ['-xf', pkgFile], function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        process.chdir(toolSpec.packages[0].opts.extractedPkgDir);
                        cb();
                    }
                });
            },
            function(cb) {
                //'cat Payload | gunzip -dc | cpio -i'
                //'cat', ['Payload', '|', 'gunzip', '-dc', '|', 'cpio', '-i']
                console.log("  extract Payload file");

                var gunzip = zlib.createGunzip();
                var rstream = fs.createReadStream('Payload');
                var wstream = fs.createWriteStream('Payload.cpio');

                rstream
                    .pipe(gunzip)
                    .pipe(wstream);

                wstream.on('error', function (err) {
                    cb(err);
                });

                wstream.on('finish', function(){
                    console.log("  remove Payload file");
                    cb();
                });
            },
            function (cb) {
                // remove Payload file
                fs.remove('Payload', cb);
            },
            function (cb) {
                // Extract Payload.cpio
                console.log("  extract Payload.cpio");
                child_process.exec('cpio -idmv < Payload.cpio', function(err) {
                    if ( err ) {
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
                fs.copy('Home', installDir, function (err) {
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
                console.log("  remove file: " + extractedPkgDir);
                fs.remove(extractedPkgDir, cb);
            },
            function(cb) {
                console.log("  unmount dmg file: " + toolSpec.packages[0].opts.osxVolumePath );
                system.spawn('hdiutil', ['detach', toolSpec.packages[0].opts.osxVolumePath ], function(err) {
                    cb(err);
                });
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }

        ], function(err) {
            callback(err);
        });
    },


    checkJavaVersion: function checkJavaVersion( requiredVersion, javaBin, callback ) {

        var spawn = child_process.spawn(javaBin, ['-version']);
        var output = '' ;

        spawn.on('error', function(err) {
            callback('java command failed');
        });

        spawn.stderr.on('data', function(data) {
            output += data;
        });

        spawn.on('close', function (code) {
            output = output.toString().split('\n')[0];
            var javaVersion = new RegExp('java version').test(output) ? output.split(' ')[2].replace(/"/g, '') : false;
            if (javaVersion != false) {

                if ( javaVersion.substring(0, requiredVersion.length) === requiredVersion ) {
                    callback(null, javaVersion);
                }
                else {
                    callback('bad java version: ' + javaVersion + '. Required version is : ' + requiredVersion);
                }
            } else {
                callback('java command failed');
            }
        });
    }
};
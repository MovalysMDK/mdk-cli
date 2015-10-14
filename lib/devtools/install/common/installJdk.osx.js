"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var zlib = require('zlib');
var child_process = require('child_process');
var assert = require('assert');

var system = require('../../../utils/system');
var config = require('../../../config');
var checkJavaVersion = require('../../check/common/java/checkJavaVersion');
var checkJavaFolder = require('../../check/common/java/checkJavaFolder');
var uninstallDir = require('./uninstallToolDir');
var defineEnv = require('../../../platform/common/jdk/defineEnv');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec tool specification
     * @param devToolsSpec devtools specification
     * @param platform platform name
     * @param osName os name
     * @param callback callback
     */
    check: function( toolSpec, devToolsSpec, platform, osName, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof devToolsSpec, 'object');
        assert.equal(typeof platform, 'string');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        async.waterfall( [
            function (cb) {
                // read configuration to known where java is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                    if (err || typeof installDir === 'undefined') {
                        cb("Not installed");
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function ( installDir, cb) {
                defineEnv(devToolsSpec, osName, platform, function(err) {
                    cb(err, installDir);
                });
            },
            function (installDir, cb) {
                checkJavaFolder( installDir, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check java version
                checkJavaVersion( toolSpec.version, installDir, cb);
            }
        ], function(err) {
            if ( err ) {
                callback(false, err);
            }
            else {
                // all checks passed, don't need to reinstall
                callback(true);
            }
        });
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>delete old directory if exists</li>
     *     <li>install products in directory $MDK_HOME/tools/jdk-version.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param callback callback
     */
    install: function( toolSpec, callback) {

        assert.equal(typeof callback, 'function');

        var installDir = toolSpec.opts.installDir;
        var dmgFile = toolSpec.packages[0];
        var mountPath = toolSpec.packages[0].opts.osxVolumePath;
        var extractedPkgDir = toolSpec.packages[0].opts.extractedPkgDir;
        var pkgFilename = mountPath.substring(mountPath.lastIndexOf('/'))+ '.pkg';
        var pkgFile = path.join(toolSpec.packages[0].opts.osxVolumePath, pkgFilename);
        var dmgMounted = false;

        async.waterfall([
            function(cb) {
                fs.access( toolSpec.packages[0].opts.osxVolumePath, fs.R_OK, function(err) {
                    if ( err ) {
                        console.log("  mount dmg file: " + dmgFile.cacheFile);
                        system.spawn('hdiutil', ['attach', dmgFile.cacheFile], function (err) {
                            if (!err) {
                                dmgMounted = true;
                            }
                            cb(err);
                        });
                    }
                    else {
                        console.log("  dmg already mounted: " + dmgFile.cacheFile);
                        dmgMounted = true;
                        cb();
                    }
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
                console.log("  copy files");
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
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }

        ], function(err) {
            if ( dmgMounted ) {
                console.log("  unmount dmg file: " + toolSpec.packages[0].opts.osxVolumePath );
                // ignore error
                system.spawn('hdiutil', ['detach', toolSpec.packages[0].opts.osxVolumePath ], function(err) {});
            }

            callback(err);
        });
    },

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, removeDependencies, callback) {
        uninstallDir(toolSpec, removeDependencies, callback);
    }
};
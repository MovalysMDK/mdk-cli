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
     * @param version
     * @param opts
     * @param callback
     */
    check: function( version, opts, callback ) {
        callback(false);
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>delete old directory if exists</li>
     *     <li>install products in directory config.get("devToolsBaseDir") + toolName + toolVersion.</li>
     * </ul>
     * @param version version of the tool to install
     * @param opts optional parameters
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
                console.log("  copy jdk");
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
    }
};
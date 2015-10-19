"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var child_process = require('child_process');
var assert = require('assert');

var system = require('../../../utils/system');
var extract = require('../../../utils/extract');
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
                checkJavaFolder( installDir, osName, function(err) {
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
     * @param osName os name
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        var cacheFile = toolSpec.packages[0].cacheFile;
        //var extratedTarFilename = toolSpec.packages[0].options.extratedTarFilename;
        var installDir = toolSpec.opts.installDir;

        console.log('cacheFile!', cacheFile);
        console.log('toolSpec.opts.workDir!', toolSpec.opts.workDir);

        async.waterfall([
            function(cb) {
                //'cat Payload | gunzip -dc | cpio -i'
                //'cat', ['Payload', '|', 'gunzip', '-dc', '|', 'cpio', '-i']
                console.log("  extract JDK compressed tar.gz file");
                extract.untarGz(cacheFile, installDir, cb);
            },
            /*function(cb) {
                process.chdir(path.join(toolSpec.opts.workDir, 'JDK'));

                console.log("  copy files");
                fs.copy(toolSpec.packages[0].options.extractedDirectory, installDir, function (err) {
                    process.chdir(path.join("..",".."));
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },*/
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            }

        ], function(err) {
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
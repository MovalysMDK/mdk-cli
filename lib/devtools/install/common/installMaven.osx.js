"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');

var checkMavenVersion = require('../../check/common/checkMavenVersion');
var checkMavenFolder = require('../../check/common/checkMavenFolder');

var system = require('../../../utils/system');
var config = require('../../../config');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec toolSpec
     * @param callback callback
     */
    check: function( toolSpec, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof callback, 'function');

        async.waterfall( [
            function (cb) {
                // read configuration to known where maven is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                    if (err || typeof installDir === 'undefined') {
                        cb("Not installed");
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                checkMavenFolder( installDir, function(err) {
                    if (err) {
                        console.log("failed to check maven folder");
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check maven version
                checkMavenVersion( toolSpec.version, installDir, cb);
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
                process.chdir(toolSpec.name +'-'+ toolSpec.version);
                console.log("  copy files");
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
    }
};
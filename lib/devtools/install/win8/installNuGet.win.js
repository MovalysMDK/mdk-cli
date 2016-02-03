"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var moment = require('moment');

var checkNuGetVersion = require('../../check/win8/nuget/checkNuGetVersion');

var mdkpath = require('../../../mdkpath');
var extract = require('../../../utils/extract');
var system = require('../../../utils/system');
var config = require('../../../config');
var uninstallDir = require('../common/uninstallToolDir');

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
                // read configuration to known where NuGet is installed.
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
                // check NuGet version
                checkNuGetVersion( toolSpec.version, installDir, cb);
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
     *     <li>install products in directory $MDK_HOME/tools/apache-NuGet-version.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param osName os name
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        var mdkPaths = mdkpath();
        toolSpec.opts.installDir = mdkPaths.toolsDir;
        var exeFrom = path.join(mdkPaths.packagesDir, "nuget.exe");
        var exeTo = path.join(mdkPaths.toolsDir, "nuget.exe");

        async.waterfall([
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            },
            function(cb) {
                // create $MDK_HOME/tools/conf
                fs.ensureDir(mdkPaths.confDir, function(err) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                // if "nuget.exe" already exists, make a backup.
                fs.access(exeTo, fs.W_OK, function(err) {
                    if ( !err) {
                        fs.copy(exeTo, exeTo + "." + moment(new Date()).format('YYYYMMDD-HHmmss'), function (err) {
                            cb(err);
                        });
                    }
                    else {
                        cb();
                    }
                });
            },
            function (cb) {
                // copy nuget.exe in tools directory.
                fs.copy(exeFrom, exeTo, function (err) {
                    cb(err);
                });
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
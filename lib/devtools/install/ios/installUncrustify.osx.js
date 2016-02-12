/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var child_process = require('child_process');
var assert = require('assert');
var io = require('../../../utils/io');

var checkUncrustifyVersion = require('../../check/ios/uncrustify/checkUncrustifyVersion');
var checkUncrustifyFolder = require('../../check/ios/uncrustify/checkUncrustifyFolder');
var defineEnv = require('../../../platform/ios/uncrustify/defineEnv');

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
                // read configuration to known where maven is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
            },
            function (installDir, cb) {
                if(typeof installDir === 'undefined') {
                    cb("Not installed");
                }
                else {
                    cb(null, installDir);
                }
            },
            function ( installDir, cb) {
                defineEnv(devToolsSpec, function(err) {
                    cb(err, installDir);
                });
            },
            function (installDir, cb) {
                checkUncrustifyFolder(installDir, function(err) {
                    if (err) {
                        console.log("failed to check uncrustify folder");
                        cb(err);
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check uncrustify version
                checkUncrustifyVersion( toolSpec.version, installDir, cb);
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
     *     <li>install products in directory $MDK_HOME/tools/uncrustify-version.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param osName osName
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        var installDir = toolSpec.opts.installDir;
        var zipFilename = toolSpec.packages[0].filename;
        var zipFile = toolSpec.packages[0].cacheFile;


        async.waterfall([
            function(cb) {
                console.log("  extract zip: " + zipFile);
                process.chdir(toolSpec.opts.workDir);
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
                console.log("  configure: " + toolSpec.name);
                process.chdir(path.join(toolSpec.name +'-'+ toolSpec.version, 'uncrustify-uncrustify-0.61'));
                var configureFile = path.join(process.cwd(), 'configure');
                system.spawn(configureFile, [], function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },

            function(cb) {
                console.log("  prepare: " + toolSpec.name + ' to install');
                process.chdir(toolSpec.packages[0].opts.binaryLocation);
                io.replaceInFile (toolSpec.packages[0].opts.versionFileNameToFix, toolSpec.packages[0].opts.baseVersionName, toolSpec.packages[0].opts.fixedVersionName, cb);
            },
            function(cb) {
                console.log("  make: " + toolSpec.name);
                process.chdir('..');
                system.spawn('make', [],  function (err ) {
                    if ( err) {
                        cb(err);
                    }
                    else {
                        cb();
                    }
                });
            },
            function(cb) {
                console.log("  copy files");
                process.chdir(toolSpec.packages[0].opts.binaryLocation);
                fs.copy(toolSpec.name, path.join(installDir, 'bin', toolSpec.name), function (err) {
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

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, removeDependencies, callback) {
        uninstallDir(toolSpec, removeDependencies, callback);
    }
};
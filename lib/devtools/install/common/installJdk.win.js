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
        var installDir = toolSpec.opts.installDir;

        async.waterfall([
            function(cb) {
                console.log("  extract JDK compressed tar.gz file");
                extract.untarGz(cacheFile, toolSpec.opts.workDir, cb);
            },
            function(cb) {
                console.log("  move files to install directory.");
                var fromDir = path.join(toolSpec.opts.workDir, toolSpec.packages[0].options.extractedDirectory);
                fs.move(fromDir, toolSpec.opts.installDir, {clobber:true}, function(moveErr) {
                    cb(moveErr);
                });
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
                // Set the JAVA_HOME environment variable
                process.env.JAVA_HOME = toolSpec.opts.installDir;
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
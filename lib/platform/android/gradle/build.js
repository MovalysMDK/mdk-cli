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
'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');
var url = require("url");
var spawn = require('child_process').spawn;

var system = require('../../../utils/system');
var isSnapshot = require('../../../utils/semversion/isSnapshot');
var getGradlePropertiesFile = require('./getGradlePropertiesFile');

/**
 * Build android project with gradle.
 * @param projectConf project configuration
 * @param clean clean project
 * @param withTests run tests
 * @param toolSpecs devtools specification
 * @param osName os name
 * @param callback callback
 */
function build(projectConf, clean, withTests, toolSpecs, osName, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof clean, 'boolean');
    assert.equal(typeof withTests, 'boolean');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    process.chdir("android");

    async.waterfall([
        function (cb) {
            getGradlePropertiesFile(toolSpecs, osName, cb);
        },
        function(gradleProperties, cb) {

            var gradleCmd = system.computeCommand('gradlew', osName, true, {"win":"bat"});
            var gradleArgs = [];

            // If snapshot and not offline, tells gradle to refresh dependencies.
            if ( isSnapshot(projectConf.project.mdkVersion) && projectConf.options.isOffline !== true) {
                gradleArgs.push("--refresh-dependencies");
            }

            if (clean) {
                gradleArgs.push("clean");
            }
            gradleArgs.push("assembleDebug");
            if (withTests) {
                gradleArgs.push("createDebugCoverageReport");
                gradleArgs.push("spoon");
            }
            gradleArgs.concat(projectConf.options.gradleOptions);

            var cmd = spawn(gradleCmd, gradleArgs, { encoding: 'utf8', stdio: ['pipe', process.stdout, process.stderr] } );

            cmd.on('close', function (code) {
                if (code !== 0) {
                    cb('gradle build failed: '+ gradleCmd + ' ' + gradleArgs );
                }
                else {
                    cb();
                }
            });
        }
    ], function(err){

        process.chdir("..");
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = build;
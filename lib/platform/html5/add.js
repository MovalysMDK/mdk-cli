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

var generate = require('../common/generate');
var createHTML5ProjectFromTemplate = require('./createHTML5ProjectFromTemplate');
var runNPMGlobal = require('./npm/runNPMGlobal');

/**
 * Add html5 platform to the project.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function add( projectConf, devToolsSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    var inconsistentFile = path.join("html5", ".inconsistent");

    async.waterfall([
        function(cb) {
            // check if html5 directory already exists
            fs.access("html5", fs.R_OK, function(err) {
                if (!err) {
                    // check if ".inconsistent" file  exists.
                    // If the file exists, it means a previous add command has failed and that we can remove the directory before retrying.
                    fs.access(inconsistentFile, fs.R_OK, function(err) {
                        if (!err) {
                            fs.remove("html5", function (err) {
                                if (err) {
                                    cb(err);
                                }
                                else {
                                    cb();
                                }
                            });
                        }
                        else {
                            cb('platform html5 already exists.');
                        }
                    });
                }
                else {
                    cb();
                }
            });
        },
        function(cb) {
            // Create project from template
            console.log('  creating html5 project from template');
            createHTML5ProjectFromTemplate(projectConf, devToolsSpecs, osName, function(err) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        },
        
        function(cb) {
            // Create inconsistent file
            fs.ensureFile(inconsistentFile, cb);
        },
        
        // [WEBAPP] Running NPM Install
		function(cb){
			runNPMGlobal("npm",
						["i", "--no-optional"],
						{
							cwd: './html5/webapp',
							message: "[WEBAPP] Running NPM Install",
							errorMessage: "Error while running NPM Install on webapp"
						},
						cb);
		},
		
		// [WEBAPP] Running Bower Install
		function(cb){
			runNPMGlobal("bower",
						["install", "--config.interactive=false"],
						{
							cwd: './html5/webapp',
							message: "[WEBAPP] Running Bower Install",
							errorMessage: "Error while running Bower Install on webapp"
						},
						cb);
		},
        
        // [CORDOVA] Running NPM Install
		function(cb){
			runNPMGlobal("npm",
						["install", "--no-optional"],
						{
							cwd: './html5/cordova',
							message: "[CORDOVA] Running NPM Install",
							errorMessage: "Error while running npmm install on cordova"
						},
						cb);
		},
		
		// [CORDOVA] Running Gulp init
		function(cb){
			runNPMGlobal("gulp",
						["init"],
						{
							cwd: './html5/cordova',
							message: "[CORDOVA] Initiating with Gulp",
							errorMessage: "Error while running gulp init on cordova"
						},
						cb);
		},
        function(cb) {
            console.log('  starting generation');
            generate(projectConf, devToolsSpecs, osName, function (err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        }
    ],
    function(err, results) {
        if (err) {
            callback(err);
        }
        else {
            //platform-add success, we can remove the inconsistent file.
            fs.remove(inconsistentFile, callback);
        }
    });
}

module.exports = add;
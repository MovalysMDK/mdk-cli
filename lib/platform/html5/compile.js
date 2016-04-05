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

var assert = require('assert');
var async = require('async');
var spawn = require('child_process').spawn;
var fs = require('fs-extra');

var config = require('../../config');
var mdkLog = require('../../utils/log');
var runNPMGlobal = require('./npm/runNPMGlobal');

/**
 * Compile html5 project without a generation
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function compile( projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');


	console.log('  HTML5 compile');
	
	async.waterfall([
        function(cb) {
            fs.access("html5", fs.R_OK, function (err) {
                if (err) {
                    cb('Platform html5 does not exists.');
                }
                else {
                    cb();
                }
            });
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
                        ["install"].concat(projectConf.options.bowerOptions),
                        {
                            cwd: './html5/webapp',
                            message: "[WEBAPP] Running Bower Install",
                            errorMessage: "Error while running Bower Install on webapp"
                        },
                        cb);
		},
		
		// [WEBAPP] Running Gulp Build
		function(cb){
			runNPMGlobal("gulp",
						["build"].concat(projectConf.options.gulpOptions),
						{
							cwd: './html5/webapp',
							message: "[WEBAPP] Building with Gulp",
							errorMessage: "Error while running gulp build on webapp"
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
		
		// [CORDOVA] Running Gulp build
		function(cb){
			runNPMGlobal("gulp",
						["build"].concat(projectConf.options.gulpOptions),
						{
							cwd: './html5/cordova',
							message: "[CORDOVA] Building with Gulp",
							errorMessage: "Error while running gulp build on cordova"
						},
						cb);
		}
		
	], function(err){
		return callback(err);
	});
}

module.exports = compile;
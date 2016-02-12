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

var async = require('async');
var exec = require('child_process').exec;

var mdkLog = require('../../../../utils/log');

/**
 * Check if an NPM package is globally installed in the correct version
 * @param toolSpec The tool specs
 * @param callback
 */
function checkNPMPackage (toolSpec, cb) {
	
	exec("npm list -g " + toolSpec.npmName, function(err, stdout, stderr){
		if ( stdout.match(toolSpec.npmName + "@" + toolSpec.version) === null ){
			return cb("Could not find " + toolSpec.name + " or the version is not correct : " + /[─|-] ([a-zA-Z0-9@._\-\(\)]*).*/g.exec(stdout)[1], toolSpec);
		}
		return cb(null, toolSpec);
	});
}

module.exports = checkNPMPackage;
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
var path = require('path');

var getInstallDir = require('./getInstallDir');
var envVars = require("../../../utils/system/envVars");
var getSettingsXmlFile = require('./getSettingsXmlFile');

/**
 * Get environment variables for Maven
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function getEnv(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, osName, platform, function(err, installDir) {
        if (err) {
            return callback(err);
        }
        else {
			var settingsFile = getSettingsXmlFile();
			var alias = "alias mvn='mvn -s \"" + settingsFile + "\"'";
			
            if (osName === "win") {
                alias = "doskey mvn=mvn -s \"" + settingsFile + "\" $*";
            }
			
			var env = [
            	envVars.computeDefinition("M2_HOME", installDir, osName),
				alias
			];
			
			var pathvar = [
				path.join(installDir, "bin")
			];
            return callback(null, env, pathvar);
        }
    });
}

module.exports = getEnv;
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
var spawn = require('child_process').spawn;

var config = require('../../../config');
var mdkPath = require('../../../mdkpath')();
var checkNPMPackage = require('../../check/html5/npm/checkNPMPackage');
var runNPMGlobal = require('../../../platform/html5/npm/runNPMGlobal');

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
		
		checkNPMPackage(toolSpec, function(err){
			if (err){
				return callback(false, err);
			}
			return callback(true);
		});

    },

    /**
     * Proceed installation.
     * @param toolSpec toolSpec
     * @param osName osName
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');
		
		runNPMGlobal("npm",
					["i", "-g", toolSpec.npmName + "@" + toolSpec.version],
					null,
					function(err){
						if (err){
							return callback(err);
						}
						toolSpec.opts.installDir = mdkPath.toolsDir;
						config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, callback);
					}
		);

    },

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, removeDependencies, callback) {
        //nothing to do.
        callback();
    }
};
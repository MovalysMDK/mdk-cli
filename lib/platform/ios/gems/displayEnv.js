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

var getGemHome = require('./getGemHome');
var getInstallDir = require('./getInstallDir');
var envVars = require("../../../utils/system/envVars");

/**
 * Display environment for cocoapods
 * @param toolsSpec tools specification
 * @param callback callback
 */
function defineEnv(toolSpecs, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    getGemHome(toolSpecs, function(err, gemHome) {
        if (err ) {
            callback(err);
        }
        else {
            getInstallDir(toolSpecs, function(err, gemHome) {
                if (err ) {
                    callback(err);
                }
                else {
                    if ( typeof process.env.GEM_HOME == 'undefined' || process.env.GEM_HOME !== gemHome ) {
                        process.env.GEM_HOME = gemHome;
                        console.log(envVars.computeDefinition("GEM_HOME", path.join(gemHome, "lib"), "osx" ));
                        console.log(envVars.computeAppendToPath(path.join(gemHome, "bin"), "osx" ));
                        console.log(envVars.computeDefinition("LANG", "en_US.UTF-8", "osx" ));
                    }
                    callback();
                }
            });
        }
    });
}

module.exports = defineEnv;
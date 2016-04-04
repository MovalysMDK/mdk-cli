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
var fse = require('fs-extra');
var path = require('path');

var getInstallDir = require('./getInstallDir');
var mdkpath = require('../../../mdkpath');

/**
 * Define environment for android sdk.
 * @param toolsSpec tools specification
 * @param osName os name
 * @param platform mobile platform
 * @param callback callback
 */
function defineEnv(toolSpecs, osName, platform, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    getInstallDir(toolSpecs, osName, platform, function(err, installDir) {
        if (err ) {
            callback(err);
        }
        else {
            process.env.ANDROID_HOME = installDir;
            process.env.ANDROID_SDK_HOME = mdkpath().dataDir;
            
            // Android will not create this folder and the previous env var if it doesn't exist
            // So we ensure the folder before
            fse.ensureDir(path.join(process.env.ANDROID_SDK_HOME, '.android'), function(err){
                return callback(err);
            });

            callback();
        }
    });
}

module.exports = defineEnv;
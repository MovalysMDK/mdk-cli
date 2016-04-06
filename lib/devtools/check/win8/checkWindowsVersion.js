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
var child_process = require('child_process');
var assert = require('assert');
var clc = require('cli-color');
var semver = require('semver');

var system = require('../../../utils/system/index');
var config = require('../../../config/index');
var devToolsSpecs = require('../../specs/index');
var mdkLog = require('../../../utils/log');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param checkSpec check specification
     * @param devToolsSpec environment specification
     * @param osName osName
     * @param platform mobile platform
     * @param callback callback
     */
    check: function( checkSpec, devToolsSpec, osName, platform, callback ) {

        assert.equal(typeof checkSpec, 'object');
        assert.equal(typeof devToolsSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof platform, 'string');
        assert.equal(typeof callback, 'function');

        var spawn = child_process.spawn('cmd', ['/c','ver']);
        var output = '' ;


        spawn.stdout.on('data', function(data) {
            output += data;
        });
        var requiredVersion = checkSpec.opts.minVersion;
        
        var cb = function(err, currentVersion) {
            if ( err ) {
                var indication =  err;
                indication = indication + '\n';
                indication = indication + clc.red.bold('     You need to install a minimum required version of Windows (' + requiredVersion + ').');
                mdkLog.ko("Windows", indication);
                return callback(false);
            }
            else {
                // all checks passed, don't need to reinstall
                mdkLog.ok("Windows", "version: " + currentVersion);
                return callback(true);
            }
        };
        
        
        spawn.on('close', function (code) {
            
            output = output.toString().split(' ')[3].split(']')[0];
            var winversion = output;
            if (winversion !== false) {
                if ( semver.gte(winversion, requiredVersion) ) {
                    return cb(null, winversion);
                }
                else {
                    return cb('bad Windows version: ' + winversion + '. Minimum required version is : ' + requiredVersion);
                }
            } else {
                return cb('ver command failed');
            }
        });
    }
};

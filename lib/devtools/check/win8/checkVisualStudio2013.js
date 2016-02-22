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
var clc = require('cli-color');

var system = require('../../../utils/system');
var config = require('../../../config');
var devToolsSpecs = require('../../specs');
var mdkLog = require('../../../utils/log');

var REGISTRY_KEY = '$(Registry:';
var Winreg = require('winreg');

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

        if (process.env.VS120COMNTOOLS !== undefined) {
            // all checks passed, don't need to reinstall
            mdkLog.ok("Visual Studio","2013");
            callback(true);
        }
        else if (process.env.VS130COMNTOOLS !== undefined) {
            // all checks passed, don't need to reinstall
            mdkLog.ok("Visual Studio","2015");
            callback(true);
        }
        else {
            mdkLog.ko(" Visual Studio", " check failed: " + clc.red.bold('You need to install Visual Studio 2013 or later'));
            callback(false);
        }
    }  
};
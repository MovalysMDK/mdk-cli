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
var mdkLog = require('../../utils/log');
var config = require('../../config');

var deployWebapp = require('../../utils/deploy/deployWebapp');

/**
 * Deploy html5 apps.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function deploy( projectConf, toolSpecs, osName, callback ) {
    if (!projectConf.project.buildDisable) {
        config.get("deployDir",function(err,result) {
            var deployDir = path.join(process.cwd(),'html5Deploy');
            if (result) {
                deployDir = path.join(result,'html5webapp');
            }
            
            deployWebapp(path.join('html5','webapp','build'), deployDir, projectConf,  function (err) {
                if (!err) {
                    mdkLog.ok('deploy html5 to ' + deployDir, 'success');
                }
                callback();
            });
        });
    } else {
        callback();
    }
}

module.exports = deploy;
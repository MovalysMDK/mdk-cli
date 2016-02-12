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

var path = require('path');
var assert = require('assert');
var semver = require('semver');
var fs = require('fs-extra');
var async = require('async');
var clc = require('cli-color');

var system = require('../utils/system');
var network = require('../utils/network');
var user = require('../user');
var projectConfig = require('./config');
var config = require('../config');
var displayMessagesVersion = require('../platform/common/displayMessagesVersion');
var mdkpath = require('../mdkpath');

/**
 * Retreives all the properties of a MDK project
 * @param callback Callback(err, infos as object)
 */
function infos( callback ) {

    assert.equal(typeof callback, 'function');

    async.waterfall([
        function(cb) {
            // read project configuration.
            projectConfig.read( function( err, projectConf ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb(null, projectConf);
                }
            });
        },
    ], function(err, result) {
        callback(err, result);
    });

}

module.exports = infos;
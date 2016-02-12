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

var fs = require('fs');
var assert = require('assert');
var async = require('async');

var config = require('../config');
var askCredentials = require('./askCredentials');

/**
 * Load credentials from configuration.
 * <p>If not credentials found, ask user.<p>
 * @param callback callback
 */
function loadCredentials(callback ) {

    // get login in configuration
    config.get("mdk_login", function(err, username ) {
        if (err) {
            callback(err);
        }
        else {
            if ( typeof username == "undefined") {
                // if not defined, ask user
                askCredentials(function(err, username, password) {
                    callback(null, username, password);
                });
            }
            else {
                // get password in configuration
                config.get("mdk_password", function(err, password ) {
                    callback(null, username, password);
                });
            }
        }
    });
}

module.exports = loadCredentials;
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

var read = require('read');
var assert = require('assert');
var clc = require('cli-color');

var config = require('../config');

/**
 * Ask mdk login/password to user.
 * <p>Credentials are saved in configuration.</p>
 * @param callback callback
 */
function askCredentials( callback ) {

    assert.equal(typeof callback, 'function');

    console.log();
    console.log('*********************************');
    console.log('*    Authentication required    *');
    console.log('*********************************');

    read({ prompt: clc.bold('MDK username: '), silent: false }, function(err, username) {
        if (err) {
            return callback("Cancelled");
        }
        read({ prompt: clc.bold('MDK password: '), silent: true }, function(err, password) {
            if (err) {
                return callback("Cancelled");
            }
            read({ prompt: clc.bold('Password confirmation: '), silent: true }, function(err, passwordConfirmation) {
                console.log();
                if (err) {
                    return callback("Cancelled");
                }

                if (password === passwordConfirmation) {
                    // save login
                    config.set("mdk_login", username, function(err) {
                        if ( err ) {
                            callback(err);
                        }
                        else {
                            // save password
                            config.set("mdk_password", password, function(err) {
                                if ( err ) {
                                    callback(err);
                                }
                                else {
                                    callback(null, username, password);
                                }
                            });
                        }
                    });
                } else {
                    callback("Password confirmation doesn't match Password");
                }
            });
        });
    });
}

module.exports = askCredentials;
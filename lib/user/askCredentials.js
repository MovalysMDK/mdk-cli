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
        read({ prompt: clc.bold('MDK password: '), silent: true }, function(err, password) {
            read({ prompt: clc.bold('Password confirmation: '), silent: true }, function(err, passwordConfirmation) {
                console.log();

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
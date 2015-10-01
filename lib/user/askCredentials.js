'use strict';

var read = require('read');
var assert = require('assert');

var config = require('../config');

/**
 * Ask mdk login/password to user.
 * <p>Credentials are saved in configuration.</p>
 * @param callback callback
 */
function askCredentials( callback ) {

    assert.equal(typeof callback, 'function');

    console.log('authentication required !');

    read({ prompt: 'mdk username: ', silent: false }, function(err, username) {
        read({ prompt: 'mdk password: ', silent: true }, function(err, password) {

            console.log();

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
        });
    });
}

module.exports = askCredentials;
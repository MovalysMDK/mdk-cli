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
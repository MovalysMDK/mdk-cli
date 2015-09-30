'use strict';

var read = require('read');
var assert = require('assert');

/**
 * Ask mdk login/password to user.
 * @param callback
 */
function askCredentials( callback ) {

    assert.equal(typeof callback, 'function');

    console.log('authentication required !');

    read({ prompt: 'mdk username: ', silent: false }, function(er, username) {
        read({ prompt: 'mdk password: ', silent: true }, function(er, password) {

            console.log();
            callback(null, username, password);
        });
    });
}

module.exports = askCredentials;
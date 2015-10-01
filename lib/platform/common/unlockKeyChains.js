"use strict";

var async = require('async');
var path = require('path');
var assert = require('assert');

var system = require('../../utils/system');

/**
 * unlockKeyChains
 * @param projectConf project configuration
 * @param callback callback
 */
function unlockKeyChains( projectConf, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof callback, 'function');

    var cmd = '/usr/bin/security';

    var loginKeyChainFile = path.join(system.userHome(), 'Library', 'Keychains', 'login.keychain');

    var listKeyChainsArgs = ['list-keychains', '-s', loginKeyChainFile];
    var defaultKeyChainsArgs = ['default-keychain','-d','user','-s', loginKeyChainFile];
    var unlockKeyChainsArgs = ['unlock-keychain','-p', projectConf.ios.keychainPwd, loginKeyChainFile];

    async.series([
        function(cb){
            system.spawn(cmd, listKeyChainsArgs, cb);
        },
        function(cb){
            system.spawn(cmd, defaultKeyChainsArgs, cb);
        },
        function(cb){
            system.spawn(cmd, unlockKeyChainsArgs, cb);
        }
    ],
    function(err, results){
        if ( err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = unlockKeyChains;

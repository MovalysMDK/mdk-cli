"use strict"

var fs = require('fs-extra');
var path = require('path');
var assert = require('assert');

var load = require('./load');
var system = require('../utils/system');

/**
 * Get a the configuration value associated to the given key
 * @param key The key of a configuration value
 * @param callback Callback
 */
function get(key, callback) {

    //Check parameters
    assert.equal(typeof key, 'string');
    assert.equal(typeof callback, 'function');

    //Load configurations
    load( true, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            getValue(key, nconf, callback);
        }
    });
}

function getValue(key, nconf, callback) {
    var value = nconf.get(key);
    switch( key ) {
        case "devToolsBaseDir":
            getDevToolsBaseDir(value, callback);
            break;
        case "devToolsPackagesDirectory":
            getDevToolsPackagesDir(value, callback);
            break;
        default:
            callback(null, value);
            break;
    }
}

function getDevToolsBaseDir( currentValue, callback ) {
    if ( !currentValue) {
        var defaultValue = path.join(system.userHome(), ".mdk", "tools");
        fs.ensureDir(defaultValue, function(err) {
            if ( err ) {
                callback(err);
            }
            else {
                callback(null, defaultValue);
            }
        });
    }
    else {
        if ( path.isAbsolute(currentValue)) {
            fs.ensureDir(currentValue, function(err) {
                if ( err ) {
                    callback(err);
                }
                else {
                    callback(null, currentValue);
                }
            });
        }
        else {
            callback("devToolsBaseDir parameter must be a absolute path. Invalid value: " + value );
        }
    }
}

/**
 * Return location of packages for installation
 * @param currentValue current value
 * @param callback callback
 */
function getDevToolsPackagesDir( currentValue, callback ) {
    if ( !currentValue) {
        var defaultValue = path.join(system.userHome(), ".mdk", "packages");
        callback(null, defaultValue);
    }
    else {
        if ( path.isAbsolute(currentValue)) {
            callback(null, currentValue);
        }
        else {
            callback("devToolsPackagesDirectory parameter must be a absolute path. Invalid value: " + value );
        }
    }
}

module.exports = get;
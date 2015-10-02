"use strict";

var fs = require('fs-extra');
var path = require('path');
var assert = require('assert');
var async = require('async');

var load = require('./load');
var system = require('../utils/system');

/**
 * Get the values of each keys of the array
 * @param keys The key of a configuration value
 * @param callback Callback
 */
function getList(keys, callback) {

    //Check parameters
    assert.equal(typeof keys, 'object');
    assert.equal(typeof callback, 'function');

    //Load configurations
    load( true, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            getListValue(keys, nconf, callback);
        }
    });
}

function getListValue(keys, nconf, callback) {

    var results = {};

    async.eachSeries(keys, function(key, cb) {

        var value = nconf.get(key);

        var resultCallback = function(err,value) {
            if (err) {
                cb(err);
            }
            else {
                results[key] = value;
                cb();
            }
        };

        switch( key ) {
            case "devToolsBaseDir":
                getDevToolsBaseDir(value, resultCallback);
                break;
            case "devToolsPackagesDirectory":
                getDevToolsPackagesDir(value, resultCallback);
                break;
            default:
                resultCallback(null,value);
                break;
        }

    }, function() {
        callback(null, results);
    });
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
            callback("devToolsBaseDir parameter must be a absolute path. Invalid value: " + currentValue );
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
            callback("devToolsPackagesDirectory parameter must be a absolute path. Invalid value: " + currentValue );
        }
    }
}

module.exports = getList;
"use strict"

var path = require('path');

var load = require('./load');
var system = require('../utils/system');


/**
 * Get a the configuration value associated to the given key
 * @param key The key of a configuration value
 * @param callback Callback
 */
function get(key, callback) {

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
            if ( !value) {
                callback(null, path.join(system.userHome(), ".mdk", "tools"));
            }
            else {
                if ( path.isAbsolute(value)) {
                    callback(value);
                }
                else {
                    callback("devToolsBaseDir parameter must be a absolute path. Invalid value: " + value );
                }
            }
            break;
        default:
            callback(null, value);
            break;
    }
}

module.exports = get;
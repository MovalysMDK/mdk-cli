"use strict"

var fs = require('fs-extra');
var assert = require('assert');

var system = require('../../utils/system');
var mergeConf = require('./mergeConf');

/**
 * Read project configuration at user level.
 * <p>Following configuration files are merged :</p>
 * <ul>
 *     <li>mdk-project.json from npm-cli installation.</li>
 *     <li>mdk-project.json from ~/.mdk/mdk-project.json</li>
 * </ul>
 * @param callback
 */
function readUserConf(callback) {

    assert.equal(typeof callback, 'function');

    var defaultConfFile = path.join(__dirname, '..', 'mdk-project.json');
    var userConfFile = path.join(system.userHome(), ".mdk", "mdk-project.json");

    fs.readJson(defaultConfFile, function(err, defaultConf) {
        if ( err) {
            // default configuration must exist.
            callback(err);
        }
        else {
            fs.access(userConfFile, fs.R_OK, function(err) {
                if ( err ) {
                    callback(null, defaultConf );
                }
                else {
                    fs.readJson(userConfFile, function(err, userConf) {
                        if ( err ) {
                            callback(err);
                        }
                        else {
                            callback(null, mergeConf( defaultConf, userConf ));
                        }
                    });
                }
            });
        }
    });
}

module.exports = readUserConf;
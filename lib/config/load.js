"use strict";

var system = require('../utils/system');
var fs = require('fs-extra');
var assert = require('assert');
var path = require('path');

/**
 * Loads the configuration from global and user stores.
 * @param readonly A boolean that indicates if the user story must be
 * loaded in read-only mode
 * @param callback Callback
 */
function load(readonly, callback) {

    //Check parameters
    assert.equal(typeof readonly, 'boolean');
    assert.equal(typeof callback, 'function');

    //Build configurations files paths
    var globalConfFile = path.join(__dirname, '..', 'mdk-cli.json');
    var userConfDirectory = path.join(system.userHome(), '.mdk', 'conf');
    var userConfFile = path.join(userConfDirectory, 'mdk-cli.json');

    //If the directory doesn't exist, create it
    fs.ensureDir(userConfDirectory, function (err) {
        if (err) {
            callback(err);
        }
        else {
            var nconf = require('nconf');

            if(readonly) {
                nconf.add('user', {type: 'file', file: userConfFile});
            }
            else {
                nconf.add('user', {type: 'file', readOnly: true, file: userConfFile});
            }
            nconf.add('global', {type: 'file', readOnly: true, file: globalConfFile});

            callback(null, nconf);
        }
    });
}

module.exports = load;
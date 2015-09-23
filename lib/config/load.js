"use strict"

var system = require('../utils/system');
var mkdirp = require('mkdirp');
var fs = require('fs');

/**
 * Loads the configuration from global and user stores.
 * @param readonly A boolean that indicates if the user story must be
 * loaded in read-only mode
 * @param callback Callback
 */
function load(readonly, callback) {
    var globalConfFile = __dirname + '/../mdk-cli.json';
    var userConfDirectory = system.userHome() + "/.mdk/"
    var userConfFile = userConfDirectory + "mdk-cli.json";

    //If the file doesn't exist, creating it
    initUserDirectory(userConfDirectory, userConfFile, function(err) {
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

/**
 * Initializes the user configuration directory
 * @param userDirectoryPath The path of the user configuration directory
 * @param userFilePath The full path of the user configuration file
 * @param callback Callback
 */
function initUserDirectory(userDirectoryPath, userFilePath,  callback) {
    fs.exists(userFilePath, function(exists) {
        if (!exists) {
            mkdirp(userDirectoryPath, callback);
        }
        else {
            callback();
        }
    });
}


module.exports = load;
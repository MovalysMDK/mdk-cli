"use strict"

var system = require('../utils/system');
var mkdirp = require('mkdirp');
var fs = require('fs');

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
                nconf.add('global', {type: 'file', file: globalConfFile});
            }
            else {
                nconf.add('user', {type: 'file', readOnly: true, file: userConfFile});
                nconf.add('global', {type: 'file', readOnly: true, file: globalConfFile});
            }
            callback(null, nconf);
        }
    });
}

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
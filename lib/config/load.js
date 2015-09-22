"use strict"

var system = require('../utils/system');

function load(callback) {

    var globalConfFile = __dirname + '/../mdk-cli.json';
    var userConfFile = system.userHome() + "/.mdk/mdk-cli.json";

    var nconf = require('nconf');
    nconf.add('user', { type: 'file', file: userConfFile });
    nconf.add('global', { type: 'file', file: globalConfFile });

    callback(null, nconf);
}

module.exports = load;
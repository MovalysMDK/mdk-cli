"use strict";


var clc = require('cli-color');
var http = require('http');

var user = require('../../../user');
var system = require('../../../utils/system');
var network = require('../../../utils/network');

module.exports = {

    /**
     * Check if require is ok.
     * @param checkSpec check specification
     * @param devToolsSpec environment specification
     * @param osName osName
     * @param platform mobile platform
     * @param callback callback
     */
    check: function( checkSpec, devToolsSpec, osName, platform, callback ) {

        user.loadCredentials(function(err, username, password) {
            var options = {
                url: 'https://git.movalys.sopra.com/git/',
                auth: {
                    user: username,
                    password: password
                }
            };

            network.downloadContent(options, function(err, result) {
                if ( err) {
                    console.log(clc.red('[KO] ') + clc.bold("MDK Git repository : ") + "Access failure : " + err);
                    callback(false);
                }
                else {
                    console.log(clc.green('[OK] ') + clc.bold("MDK Git repository : ") + "Access success");
                    callback(true);
                }
            });

        });



    }
};

'use strict';

var isLinux = require('./isLinux');
var isMacOS = require('./isMacOS');
var isWin = require('./isWin');

function osName(callback) {

    isWin(function(result) {
        if ( result ) {
            callback(null, "win");
        }
        else {
            isMacOS(function( result ) {
                if ( result ) {
                    callback(null, "osx");
                }
                else {
                    isLinux(function( result ) {
                        if ( result ) {
                            callback(null, "linux");
                        }
                        else {
                            callback("Unkown operating system.");
                        }
                    });
                }
            });
        }
    });
}

module.exports = osName;
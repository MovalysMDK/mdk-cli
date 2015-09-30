'use strict';

function isWin(callback) {
    var isWindows = /^win/.test(process.platform);
    callback(isWindows);
}

module.exports = isWin;
'use strict';

function isWin(callback) {
    var isWindows = /^win[0-9]*/.test(process.platform);
    callback(isWindows);
}

module.exports = isWin;
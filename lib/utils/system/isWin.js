'use strict'

function isWin(callback) {
    var isWin = /^win/.test(process.platform);
    callback(isWin);
}

module.exports = isWin;
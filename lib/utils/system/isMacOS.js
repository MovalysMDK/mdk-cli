'use strict'

function isMacOS(callback) {
    var isMacOS = /^darwin/.test(process.platform);
    callback(isMacOS);
}

module.exports = isMacOS;
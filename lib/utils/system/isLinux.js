'use strict'

function isLinux(callback) {
    var isLinux = /^linux/.test(process.platform);
    callback(isLinux);
}

module.exports = isLinux;
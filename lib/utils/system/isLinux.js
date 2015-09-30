'use strict';

function isLinux(callback) {
    var isLinuxOs = /^linux/.test(process.platform);
    callback(isLinuxOs);
}

module.exports = isLinux;
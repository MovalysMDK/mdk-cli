'use strict';

function isMacOS(callback) {
    var isOsx = /^darwin/.test(process.platform);
    callback(isOsx);
}

module.exports = isMacOS;
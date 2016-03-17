"use strict"

var dateFormat = require('dateformat');

function buildNumber() {
    var buildNr = null;
    if ( process.env.BUILD_NUMBER ) {
        // from jenkins
        buildNr = process.env.BUILD_NUMBER;
    }
    else {
        var now = new Date();
        buildNr = dateFormat(now, 'yyyymmdd_HHMM');
    }
    return buildNr;
}

module.exports = buildNumber;
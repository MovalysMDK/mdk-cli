"use strict";

var fs = require('fs');

/**
 * Return duration in milliseconds since file was modified.
 * @param file The file
 */
function timeFromLastEdition(file) {

    var stats = fs.statSync(file);
    var date1 = stats.mtime.getTime();
    var date2 = new Date().getTime();
    return date2 - date1;
}

module.exports = timeFromLastEdition;
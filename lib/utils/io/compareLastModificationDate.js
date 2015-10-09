"use strict";

var fs = require('fs');

/**
 * Return a integer that is positive if the file 1 has been edited after the file 2,
 * negative if the file 1 has been edited before the file 2, or 0 if both files have the same
 * last edition date.
 * @param file1 The first file
 * @param file2 The second file
 * @return An integer that indicates which file has been edited last
 */
function compareLastModificationDate(file1, file2) {
    var file1Stats = fs.statSync(file1);
    var file2Stats = fs.statSync(file2);
    return ( file1Stats.mtime.getTime() - file2Stats.mtime.getTime()) > 0;
}




module.exports = compareLastModificationDate;
"use strict";

var fs = require('fs');
var timeFromLastEdition = require('./timeFromLastEdition.js');

/**
 * Return a integer that is positive is positive if the file 1 has been edited after the file 2,
 * negative if the file 1 has been edited before the file 2, or 0 if both files have the same
 * last edition date.
 * @param file1 The first file
 * @param file2 The second file
 * @return An integer that indicates which file has been edited last
 */
function filesLastEditionCompare(file1, file2) {
    return timeFromLastEdition(file2) - timeFromLastEdition(file1);
}




module.exports = filesLastEditionCompare;
'use strict';

var assert = require('assert');
var computeDefinition = require('./computeDefinition');

/**
 * Compute command to append a directory in the PATH env variable.
 * @param directory variable name
 * @param osName os name
 * @return string command to append directory to path.
 */
function computeAppendToPath(directory, osName ) {

    assert.equal(typeof directory, 'string');
    assert.equal(typeof osName, 'string');

    var newPath = directory;
    switch(osName){
        case "osx":
            newPath = newPath + ":$PATH";
            break;
        case "win":
            newPath = newPath + ";%PATH%";
            break;
    }
    return computeDefinition("PATH", newPath, osName);
}

module.exports = computeAppendToPath;
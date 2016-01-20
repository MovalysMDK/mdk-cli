'use strict';

var assert = require('assert');

/**
 * Compute command to define env variable.
 * @param variableName variable name
 * @param variableValue variable definition
 * @param osName os name
 * @return string command to define env var.
 */
function computeDefinition(variableName, variableValue, osName ) {

    assert.equal(typeof variableName, 'string');
    assert.equal(typeof variableValue, 'string');
    assert.equal(typeof osName, 'string');

    var cmd = variableName + "=" + variableValue;
    switch(osName){
        case "osx":
            cmd = "export " + cmd;
            break;
        case "win":
            cmd = 'set "' + cmd + '"';
            break;
    }
    return cmd;
}

module.exports = computeDefinition;
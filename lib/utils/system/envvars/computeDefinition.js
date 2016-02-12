/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
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
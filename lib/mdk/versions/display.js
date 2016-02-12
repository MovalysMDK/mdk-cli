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
"use strict";

var clc = require('cli-color');
var assert = require('assert');

/**
 * Display a MDK version infos
 * @param versionObject The MDK version object
 * @param callback Callback
 */
function displayVersionInfos(versionObject, callback) {

    //Check parameters
    assert.equal(typeof versionObject, 'object');
    assert.equal(typeof callback, 'function');

    //Prints version infos
    console.log(clc.bold('Infos for version : ')+ versionObject.version);
    if(versionObject.messages) {
        versionObject.messages.forEach(function (message) {
            if (message.level.length > 0) {
                if (message.level === 'info') {
                    console.log(clc.green('[INFO]') + ' : ' + message.text);
                }
                else if (message.level === 'warn') {
                    console.log(clc.yellow('[WARNING]') + ' : ' + message.text);
                }
                else if (message.level === 'error') {
                    console.log(clc.red('[ERROR]') + ' : ' + message.text);
                }
            }


        });
    }
    console.log(clc.bold('Associated tools version : ')+ versionObject.devToolsVersion);
    callback(0);

}


module.exports = displayVersionInfos;
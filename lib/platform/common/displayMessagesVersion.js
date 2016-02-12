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

var versions = require('../../mdk/versions');
var clc = require('cli-color');
var assert = require('assert');

/**
 * Prints messages about the given version
 * @param mdkVersion The MDK version to print messages
 * @param callback The callback
 */
function displayMessagesVersion(mdkVersion, callback) {

    assert.equal(typeof mdkVersion, 'string');
    assert.equal(typeof callback, 'function');

    versions.get(mdkVersion, false, function(err, result) {
        if(!err && result && result.messages) {
            result.messages.forEach(function(message) {
                if(message.level === 'info') {
                    console.log(clc.green.bold(buildMessageFromText(mdkVersion, message.text)));
                }
                else if (message.level === 'warning') {
                    console.log(clc.yellow.bold(buildMessageFromText(mdkVersion, message.text)));
                }
                else if (message.level === 'error') {
                    console.log(clc.red.bold(buildMessageFromText(mdkVersion, message.text)));
                }
                else {
                    console.log(message.text);
                }
            });
            console.log();
            callback();
        }
        else {
            callback(err);
        }
    });
}

/**
 * This build the message to print given a MDK version and the message content to display
 * @param mdkVersion The MDK Version
 * @param text The message content
 * @returns The built message to display
 */
function buildMessageFromText(mdkVersion, text) {
    return '[MDK ' + mdkVersion+ '] : ' + text;
}


module.exports = displayMessagesVersion;
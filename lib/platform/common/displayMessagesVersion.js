'use strict';

var versions = require('../../versions');
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
        if(!err && result) {
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
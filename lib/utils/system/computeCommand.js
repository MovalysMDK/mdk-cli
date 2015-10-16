'use strict';

var assert = require('assert');

/**
 * Compute a command call following the given parameters
 * @param command The command to execute
 * @param osName The OS name where will be executed the command
 * @param isLocal Indicated if the call of the command is local or not
 * @param extension The potential extension of the command to execute
 * @return A complete command call
 */
function computeCommand(command, osName, isLocal, extension) {

    assert(typeof command === 'string');
    assert(typeof osName === 'string');
    assert(typeof isLocal === 'boolean');
    //extension is optional

    var prefix  = '';
    var cmd = command;
    var suffix= '';
    console.log("OS NAME : ", osName);
    switch(osName) {
        case 'win':
            if(typeof extension != 'undefined') {
                suffix = '.'+ extension;
            }
            break;
        case 'osx':
        case 'linux':
            if(isLocal) {
                prefix = './';
            }
            if(typeof extension != 'undefined') {
                suffix = '.'+ extension;
            }
            break;
        default :
            break;
    }
    var result = prefix+cmd+suffix;
    return result;

}

module.exports = computeCommand;
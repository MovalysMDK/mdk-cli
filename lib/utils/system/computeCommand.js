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
    switch(osName) {
        case 'win':
            if((typeof extension[osName] != 'undefined') && (typeof extension[osName] != 'undefined')) {
                suffix = '.'+  extension[osName];
            }
            break;
        case 'osx':
        case 'linux':
            if(isLocal) {
                prefix = './';
            }
            if((typeof extension[osName] != 'undefined') && (typeof extension[osName] != 'undefined')) {
                suffix = '.'+ extension[osName];
            }
            break;
        default :
            break;
    }
    var result = prefix+cmd+suffix;
    return result;

}

module.exports = computeCommand;
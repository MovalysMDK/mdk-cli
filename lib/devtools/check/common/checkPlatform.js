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

var system = require('../../../utils/system');

/**
 * Check platform is valid :
 * <ul>
 *     <li>Is one of the following values : android, ios</li>
 *     <li>Is supported by the os => android:[osx, windows], ios:[osx]</li>
 * </ul>
 * @param platformName mobile platform
 * @param callback callback
 */
function checkPlatform( platformName, callback) {

    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    switch(platformName) {
        case 'ios':
            var platformiOSOk = true;
            system.isWin(function (isWin) {
                if(isWin) {
                    platformiOSOk = false;
                    callback('iOS is not supported on Windows platform');
                }
            });
            system.isLinux(function (isLinux) {
                if(isLinux){
                    platformiOSOk = false;
                    callback('iOS is not supported on Linux platform');
                }
            });
            if ( platformiOSOk ) {
                callback();
            }
            break;
        case 'android':
            //Supported everywhere
            callback();
            break;
		/*case 'html5':
			// Supported everywhere
			callback();
			break;
        case 'win8':
            var platformWinOk = true;
            system.isMacOS(function (isWin) {
                if(isWin) {
                    platformWinOk = false;
                    callback('win8 is not supported on MacOS platform');
                }
            });
            system.isLinux(function (isLinux) {
                if(isLinux){
                    platformWinOk = false;
                    callback('win8 is not supported on Linux platform');
                }
            });
            if ( platformWinOk ) {
                callback();
            }
            break;*/
        default:
            callback("Unrecognized platform : '" + platformName + "'");
            break;
    }
}

module.exports = checkPlatform;
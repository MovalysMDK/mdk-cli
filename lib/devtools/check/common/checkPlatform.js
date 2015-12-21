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
            var platformOk = true;
            system.isWin(function (isWin) {
                if(isWin) {
                    platformOk = false;
                    callback('iOS is not supported on Windows platform');
                }
            });
            system.isLinux(function (isLinux) {
                if(isLinux){
                    platformOk = false;
                    callback('iOS is not supported on Linux platform');
                }
            });
            if ( platformOk ) {
                callback();
            }
            break;
        case 'android':
            //Supported everywhere
            callback();
            break;
		case 'html5':
			// Supported everywhere
			callback();
			break;
        default:
            callback("Unrecognized platform : '" + platformName + "'");
            break;
    }
}

module.exports = checkPlatform;
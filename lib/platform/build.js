'use strict';

var assert = require('assert');

var androidPlatform = require('./android');
var iosPlatform = require('./ios');

/**
 * Build platform.
 * @param platformName platform
 * @param callback callback
 */
function build( platformName, callback ) {

    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    switch(platformName) {
        case 'android':
            androidPlatform.build(callback);
            break;
        case 'ios':
            iosPlatform.build(callback);
            break;
        default:
            callback('Unkown platform: ' + platformName);
            break;
    }
}

module.exports = build;
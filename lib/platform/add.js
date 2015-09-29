'use strict'

var assert = require('assert');

var androidPlatform = require('./android');
var iosPlatform = require('./ios');

/**
 * Add platform to the project.
 * @param platformName platform
 * @param callback callback
 */
function add( platformName, callback ) {

    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    switch(platformName) {
        case 'android':
            androidPlatform.add(callback);
            break;
        case 'ios':
            iosPlatform.add(callback);
            break;
        default:
            callback('Unkown platform: ' + platformName);
            break;
    }
}

module.exports = add;
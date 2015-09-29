'use strict'

var assert = require('assert');

/**
 * Add platform to the project.
 * @param platform platform
 * @param callback callback
 */
function add( platform, callback ) {

    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    callback();
}

module.exports = add;
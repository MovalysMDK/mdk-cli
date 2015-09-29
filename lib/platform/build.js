'use strict'

var assert = require('assert');

/**
 * Build platform.
 * @param platform platform
 * @param callback callback
 */
function build( platform, callback ) {

    assert.equal(typeof platform, 'string');
    assert.equal(typeof callback, 'function');

    callback();
}

module.exports = build;
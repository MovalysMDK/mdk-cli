'use strict';

var assert = require('assert');

/**
 * Build android platform.
 * @param callback callback
 */
function build( callback ) {

    assert.equal(typeof callback, 'function');

    callback();
}

module.exports = build;
'use strict'

var assert = require('assert');

/**
 * Add ios platform to the project.
 * @param callback callback
 */
function add( callback ) {

    assert.equal(typeof callback, 'function');

    callback();
}

module.exports = add;
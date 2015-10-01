'use strict';

var assert = require('assert');

/**
 * Build android platform.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param callback callback
 */
function build( projectConf, devToolsSpecs, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof callback, 'function');

    callback();
}

module.exports = build;
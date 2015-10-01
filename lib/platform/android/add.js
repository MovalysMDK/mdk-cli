'use strict';

var assert = require('assert');

/**
 * Add android platform to the project.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param callback callback
 */
function add( projectConf, devToolsSpecs, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof callback, 'function');

    callback();
}

module.exports = add;
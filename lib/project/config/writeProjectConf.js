'use strict';

var fs = require('fs-extra');
var assert = require('assert');

/**
 * Save project configuration in project directory.
 * @param conf configuration
 * @param callback callback
 */
function writeProjectConf( conf, callback ) {

    assert.equal(typeof conf, 'object');
    assert.equal(typeof callback, 'function');

    fs.writeFile('mdk-project.json', JSON.stringify(conf, null, 4), function (err) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
}

module.exports = writeProjectConf;
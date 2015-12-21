'use strict';

var assert = require('assert');
var async = require('async');

var jdk = require('../common/jdk');
var maven = require('../common/maven');

/**
 * Display required shell environment for mdk.
 * @param projectConf project configuration
 * @param devToolsSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function displayEnv( projectConf, devToolsSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    async.waterfall([
        function(cb) {
            //jdk.displayEnv(devToolsSpecs, osName, "android", cb);
        	return cb();
		}
    ],
    function(err, results) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = displayEnv;
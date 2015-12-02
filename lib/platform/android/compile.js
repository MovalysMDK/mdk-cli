"use strict";

var assert = require('assert');

var gradle = require('../android/gradle');

/**
 * Compile android project without a generation
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function compile( projectConf, toolSpecs, osName, callback ) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');


	console.log('  gradle build');
	
	gradle.build(projectConf, true, false, toolSpecs, osName, function(err, results) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
        
}

module.exports = compile;
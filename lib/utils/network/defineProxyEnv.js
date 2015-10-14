'use strict';

var fs = require('fs');
var request = require('request');
var assert = require('assert');

var findProxy = require('./findProxy');

/**
 * Add proxy shell variables.
 * @param callback callback
 */
function defineProxyEnv(callback) {

    assert.equal(typeof callback, 'function');

    findProxy( function(err, proxy) {

        if (err) {
            callback('find proxy failed' +err);
        }
        else {

            // define HTTP_PROXY env variable
            if ( typeof proxy !== 'undefined' && typeof process.env.http_proxy === 'undefined' ) {
                process.env.http_proxy = proxy ;
            }

            // define HTTPS_PROXY env variable
            if ( typeof proxy !== 'undefined' && typeof process.env.https_proxy === 'undefined' ) {
                process.env.https_proxy = proxy ;
            }
        }
        callback();
    });
}

module.exports = defineProxyEnv;

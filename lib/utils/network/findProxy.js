'use strict';

var system = require('../system');
var assert = require('assert');

/**
 * Find proxy.
 * @param callback
 */
function findProxy( callback ) {

    assert.equal(typeof callback, 'function');

    // check first in .npmrc
    system.spawn('npm', ['config',  'get', 'proxy'], function(err, output) {

        if ( err ) {
            callback(err);
        }
        else {
            var proxy = output;
            if ( proxy !== undefined ) {
                proxy = proxy.replace(/(\r\n|\n|\r)/gm,"");
            }

            if ( !proxy || proxy === 'undefined' || proxy === 'null') {

                // if not found, check HTTP_PROXY env var
                if ( process.env.http_proxy ) {
                    callback(null, process.env.http_proxy);
                }
                else {
                    callback();
                }
            }
            else {
                callback(null, proxy);
            }
        }
    });
}

module.exports = findProxy;
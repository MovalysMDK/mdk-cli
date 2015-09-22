'use strict'

var system = require('../system');

function findProxy( callback ) {

    // check first in .npmrc
    system.spawn('npm', ['config',  'get', 'proxy'], function(err, output) {
        if ( err ) {
            callback(err);
        }
        else {
            if ( output === 'undefined') {

                // if not found, check HTTP_PROXY env var
                if ( process.env.http_proxy ) {
                    callback(null, process.env.http_proxy);
                }
                else {
                    callback();
                }
            }
            else {
                callback(null, output);
            }
        }
    });
}

module.exports = findProxy;
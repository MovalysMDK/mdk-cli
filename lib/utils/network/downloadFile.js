'use strict';

var fs = require('fs');
var request = require('request');
var assert = require('assert');

var findProxy = require('./findProxy');

/**
 * Download file on disk.
 * @param options options containing url and http parameters.
 * @param dest file target.
 * @param callback callback
 */
function downloadFile(options, dest, callback) {

    assert.equal(typeof options, 'object');
    assert.equal(typeof dest, 'string');
    assert.equal(typeof callback, 'function');

    // options.url
    // options.method
    // options.auth: { user:,pass: }
    findProxy( function(err, proxy) {

        if (err) {
            callback('find proxy failed' +err);
        }
        else {
            if ( !options.proxy && proxy ) {
                options.proxy = proxy;
            }

            options.followRedirect = true ;
            options.strictSSL = false ;

            //to debug:
            //request.debug = true;

            var r = request.get(options);
            r.on('response', function(response) {
                if ( response.statusCode == 200 ) {
                    var wstream = fs.createWriteStream(dest);
                    wstream.on('error', function (err) {
                        callback(err);
                    });
                    wstream.on('finish', function(){
                        callback();
                    });
                    r.pipe(wstream);
                }
                else {
                    callback("Download failed with status code : " + response.statusCode + ", url: " + options.url );
                }
            });
            r.on('error', function(err) {
                callback(err);
            });
        }
    });
}

module.exports = downloadFile;

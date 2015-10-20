'use strict';

var fs = require('fs');
var request = require('request');
var ProgressBar = require('progress');
var assert = require('assert');

var findProxy = require('./findProxy');

/**
 * Download file on disk.
 * @param options options containing url and http parameters.
 * @param dest file target.@
 * @param Indicates if the progress of download shoul be sho
 * @param callback callback
 */
function downloadFile(options, dest, showProgress, callback) {

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
            var index = 0;

            var bar;

            r.on('response', function(response) {
                var len = parseInt(response.headers['content-length']);
                if(showProgress) {
                    bar = new ProgressBar('  downloading [:bar] :percent :etas', {
                        complete: '=',
                        incomplete: ' ',
                        width: 50,
                        total: len
                    });
                }

                if (response.statusCode == 200) {
                    var wstream = fs.createWriteStream(dest);

                    wstream.on('error', function (err) {
                        callback(err);
                    });
                    wstream.on('finish', function () {
                        callback();
                    });
                    r.pipe(wstream);
                }
                else {
                    callback("Download failed with status code : " + response.statusCode + ", url: " + options.url);
                }
            })

                .on('data', function (chunk) {
                    if(showProgress && (typeof chunk.length != "undefined")) {
                        bar.tick(chunk.length);
                    }
                })

                .on('error', function(err) {
                    callback(err);
                });
        }
    });
}

module.exports = downloadFile;

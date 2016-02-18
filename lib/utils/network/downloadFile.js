/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var fs = require('fs');
var request = require('request');
var Gauge = require("gauge");
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
			
			options.timeout = 10 * 1000; // 10 seconds

            // to debug:
            //request.debug = true;

            var r = request.get(options);

            var bar;
            var len;

            r.on('response', function(response) {
                len = parseInt(response.headers['content-length']);
                if(showProgress) {
                    bar = new Gauge();
                    bar.show(dest);
                }

                if (response.statusCode == 200) {
                    var wstream = fs.createWriteStream(dest);

                    wstream.on('error', function (err) {
                        callback(err);
                    });
                    wstream.on('finish', function () {
                        callback();
                    });
                    wstream.on('data', function (chunk) {
                        if(showProgress && (typeof chunk.length === "number")) {
                            bar.show(dest,chunk.length/len);
                        }
                    });
                    r.pipe(wstream);
                }
                else {
                    callback("Download failed with status code : " + response.statusCode + ", url: " + options.url);
                }
            })
                .on('error', function(err) {
                    callback(err);
                });
        }
    });
}

module.exports = downloadFile;

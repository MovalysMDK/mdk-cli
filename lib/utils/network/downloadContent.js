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
var assert = require('assert');

var findProxy = require('./findProxy');

/**
 * Download file content.
 * @param options object containing url and http parameters.
 * @param callback callback
 */
function downloadContent(options, callback) {

    assert.equal(typeof options, 'object');
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
                options.proxy = process.env.http_proxy;
            }

            options.followRedirect = true ;
            options.strictSSL = false ;
			
			// Timeout 10 seconds
			options.timeout = 1000 * 10;

            //to debug: require('request').debug = true
            request.get(options, function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    callback(null,body);
                }
                else {
                    //not always a response
                    if ( response ) {
                        callback('download failed with status code: ' + response.statusCode + ' ' + error);
                    }
                    else {
                        callback('download failed with err: ' + error);
                    }
                }
            });
        }
    });
}

module.exports = downloadContent;

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

            if ( proxy === 'undefined' || proxy === 'null') {
                // if not found, check HTTP_PROXY env var
                if ( typeof process.env.http_proxy === "string" &&
                    process.env.http_proxy !== 'undefined' &&
                    process.env.http_proxy !== '' &&
                    process.env.http_proxy !== 'null') {
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
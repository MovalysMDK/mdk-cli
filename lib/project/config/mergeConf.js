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
"use strict";

var fs = require('fs-extra');

/**
 * Merge configuration passed in parameters.
 */
function mergeConf() {
    var destination = {};
    var sources = [].slice.call( arguments, 0 );
    sources.forEach(function( source ) {
        var prop;
        for ( prop in source ) {
            if ( prop in destination && Array.isArray( destination[ prop ] ) ) {

                // Concat Arrays
                destination[ prop ] = destination[ prop ].concat( source[ prop ] );

            } else if ( prop in destination && typeof destination[ prop ] === "object" ) {

                // Merge Objects
                destination[ prop ] = mergeConf( destination[ prop ], source[ prop ] );

            } else {

                // Set new values
                destination[ prop ] = source[ prop ];

            }
        }
    });
    return destination;
}

module.exports = mergeConf;
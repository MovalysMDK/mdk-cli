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

var dateFormat = require('dateformat');

function buildNumber() {
    var buildNr = null;
    if ( process.env.BUILD_NUMBER ) {
        // from jenkins
        buildNr = process.env.BUILD_NUMBER;
    }
    else {
        var now = new Date();
        buildNr = dateFormat(now, 'yyyymmdd_HHMM');
    }
    return buildNr;
}

module.exports = buildNumber;
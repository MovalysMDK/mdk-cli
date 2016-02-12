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

var fs = require('fs-extra');
var assert = require('assert');

/**
 * Save project configuration in project directory.
 * @param conf configuration
 * @param callback callback
 */
function writeProjectConf( conf, callback ) {

    assert.equal(typeof conf, 'object');
    assert.equal(typeof callback, 'function');

    fs.writeFile('mdk-project.json', JSON.stringify(conf, null, 4), function (err) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
}

module.exports = writeProjectConf;
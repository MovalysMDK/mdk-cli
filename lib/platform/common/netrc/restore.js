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
var async = require('async');
var path = require('path');
var assert = require('assert');

var system = require('../../../utils/system');
var config = require('../../../config');

/**
 * Restore the backup of file .netrc
 * @param osName osName
 * @param callback callback
 */
function restore(osName, callback) {

    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    var netrcFile ;
    var backupFile ;
    if ( osName === "win" ) {
        netrcFile = path.join(system.userHome(), "_netrc");
        backupFile = netrcFile + "_mdkbackup";
    }
    else {
        netrcFile = path.join(system.userHome(), ".netrc");
        backupFile = netrcFile + ".mdkbackup";
    }

    fs.access(backupFile, fs.F_OK, function(err) {
        if (err) {
            fs.remove(netrcFile, function(err) {
                callback(err);
            });
        }
        else {
            // backup current .netrc
            fs.move(backupFile, netrcFile, { "clobber": true }, function (err) {
                callback(err);
            });
        }
    });
}

module.exports = restore;
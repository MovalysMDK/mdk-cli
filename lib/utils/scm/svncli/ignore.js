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

var spawn = require('../../system/spawn');

function ignore( baseDir, files, callback ) {

    var popDir = process.cwd();
    process.chdir(baseDir);

    var fileContent = files[0];
    for(var i = 1; i< files.length; i++) {
        fileContent += "\n" + files[i];
    }

    fs.writeFile('.tmp', fileContent, function (err) {
        if (err) {
            callback(err);
        }
        else {
            var params = ["propset", "svn:ignore", "-F", ".tmp", "."];
            spawn( 'svn', params, function(err,stdout) {
                fs.unlinkSync(".tmp");
                process.chdir(popDir);
                if ( err ) {
                    callback(err);
                }
                else {
                    callback(null, stdout);
                }
            });
        }
    });
}

module.exports = ignore;
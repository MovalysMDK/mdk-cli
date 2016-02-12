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

var fs = require('fs');

/**
 * Return a integer that is positive if the file 1 has been edited after the file 2,
 * negative if the file 1 has been edited before the file 2, or 0 if both files have the same
 * last edition date.
 * @param file1 The first file
 * @param file2 The second file
 * @return An integer that indicates which file has been edited last
 */
function compareLastModificationDate(file1, file2) {
    var file1Stats = fs.statSync(file1);
    var file2Stats = fs.statSync(file2);
    return file1Stats.mtime.getTime() - file2Stats.mtime.getTime();
}




module.exports = compareLastModificationDate;
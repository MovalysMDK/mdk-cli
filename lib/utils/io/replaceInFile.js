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
 * Replace text in file
 * @param file file
 * @param searchString search string
 * @param newString replacement
 * @param callback callback
 */
function replaceInFile( file, searchString, newString, callback ) {

	var content = fs.readFileSync(file, {encoding: 'utf8'});
	var pattern = new RegExp( searchString, 'im');
	var result = content.replace(pattern, newString);
	fs.writeFile(file, result, callback);
}

module.exports = replaceInFile;
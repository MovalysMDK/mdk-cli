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
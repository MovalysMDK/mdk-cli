"use strict";

/**
 * Imports
 */
var fs = require('fs');


function getPlatforms( callback ){
	
	fs.readdir( process.cwd(), function(err, files){

		if (err){
			return callback(err);
		}

		var platformList = [];

		if ( files.indexOf("android") != -1 ){
			platformList.push("android");
		}
		if ( files.indexOf("ios") != -1 ){
			platformList.push("ios");
		}
		
		return callback(null, platformList);
		
	});
	
}

module.exports = getPlatforms;
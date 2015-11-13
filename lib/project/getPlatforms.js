"use strict";

/**
 * Imports
 */
var fs = require('fs');


function getPlatform( callback ){
	
	fs.readdir( process.cwd(), function(err, files){

		if (err){
			return callback(err);
		}

		var platfromList = [];

		if ( files.indexOf("android") != -1 ){
			platfromList.push("android");
		}
		if ( files.indexOf("ios") != -1 ){
			platfromList.push("ios");
		}
		
		return callback(null, platfromList);
		
	});
	
}

module.exports = getPlatform;
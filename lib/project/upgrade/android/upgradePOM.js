"use strict";

/**
 * Imports
 */
var fs = require('fs');
var path = require('path');
var async = require('async');
var xmldom = require('xmldom');


function upgradePOM(target, callback){
	var pomURL = path.join(process.cwd(), "android", "POM.xml");
	
	async.waterfall([
		
		// Check if POM.xml exists
		function(cb){
			fs.exists(pomURL, function(exists){
				if ( ! exists ){
					return cb("The POM.xml file could not be found for platform Android");
				}else{
					return cb();
				}
			})
		},
		
		// Read content
		function(cb){
			fs.readFile( pomURL, cb );
		},
		
		// Parse to XML DOM object
		function(data, cb){
			var parser = new xmldom.DOMParser();
			var doc = parser.parseFromString( data.toString() , 'text/xml' );
			return cb( null, doc );

		},
		
		// Edit XML as javascript object
		function(pom, cb){
			var node = pom.getElementsByTagName("project")[0]
				.getElementsByTagName("parent")[0]
					.getElementsByTagName("version")[0]
						.childNodes[0];
			node.data = node.nodeValue = target;
			return cb(null, pom);
		},
		
		// Save the edited POM.xml file
		function(pom, cb){
			fs.writeFile(pomURL + ".new", pom.toString(), cb);
		}
		
	], function(err){
		return callback(err);
	});
}

module.exports = upgradePOM;
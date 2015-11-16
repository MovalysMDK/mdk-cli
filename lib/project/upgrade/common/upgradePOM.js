"use strict";

/**
 * Imports
 */
var fse = require('fs-extra');
var path = require('path');
var async = require('async');
var xmldom = require('xmldom');


function upgradePOM(mdkTarget, platform, callback){
	var pomURL = path.join(process.cwd(), platform, "POM.xml");
	
	async.waterfall([
		
		// Check if POM.xml exists
		function(cb){			
			fse.access(pomURL, fse.R_OK | fse.W_OK, function(err){
				if ( err ){
					return cb("The POM.xml file could not be found or is not accessible for platform " + platform);
				}else{
					return cb();
			}
			});
		},
		
		// Read content
		function(cb){
			fse.readFile( pomURL, cb );
		},
		
		// Parse to XML DOM object
		function(data, cb){
			var parser = new xmldom.DOMParser();
			var pom = parser.parseFromString( data.toString() , 'text/xml' );
			return cb( null, pom );

		},
		
		// Edit XML as javascript object
		function(pom, cb){
			var node = pom.getElementsByTagName("project")[0]
				.getElementsByTagName("parent")[0]
					.getElementsByTagName("version")[0]
						.childNodes[0];
			node.data = node.nodeValue = mdkTarget;
			return cb(null, pom);
		},
		
		// Save the edited POM.xml file
		function(pom, cb){
			fse.writeFile(pomURL, pom.toString(), cb);
		}
		
	], function(err){
		return callback(err);
	});
}

module.exports = upgradePOM;
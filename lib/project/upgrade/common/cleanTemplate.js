"use strict";

/**
 * Imports
 */
var async = require('async');
var fse = require('fs-extra');

var mdkLog = require('../../../utils/log');

/**
 * Cleans the template (downloaded to get upgrade scripts)
 * Both zipped and unzipped versions are deleted if they exist
 * No error are launched from here, just console notices.
 * 
 * @param {string} 		parent 		Location of the template parent folder (1st level folder in the zip)
 * @param {string} 		zip			Location of the template ZIP file to delete
 * @param {Function} 	callback	Callback() just to notice operation ended (no errors can be fired)
 */
function cleanTemplate(parent, zip, callback){
	
	async.waterfall([
		
		// Clean ZIP
		function(cb){
			if (zip !== null){
				fse.remove( zip, function(err){
					if (err){
						mdkLog.ko("A temp ZIP could not be deleted in " + zip + " : " + err);
					}
					return cb(); // We don't throw any errors, but notify the user
				});
			}else{
				return cb();
			}
		},
		
		// Clean unZipped
		function(cb){
			if (parent !== null){
				fse.remove( parent, function(err){
					if (err){
						mdkLog.ko("A temp folder could not be deleted in " + parent + " : " + err);
					}
					return cb(); // We don't throw any errors, but notify the user
				});
			}else{
				return cb();
			}
		}
		
	], function(err){
		return callback(); // No errors
	});
	
}

module.exports = cleanTemplate;
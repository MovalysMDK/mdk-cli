"use strict";

/**
 * Imports
 */
var async = require('async');
var fse = require('fs-extra');

var mdkLog = require('../../../utils/log');


function cleanTemplate(parent, zip, callback){
	
	async.waterfall([
		
		// Clean ZIP
		function(cb){
			if (zip != null){
				fse.remove( zip, function(err){
					if (err){
						mdkLog.ko("A temp ZIP could not be deleted in " + zip + " : " + err);
					}
					return cb(); // We don't throw any errors, but notify the user
				});
			}
		},
		
		// Clean unZipped
		function(cb){
			if (parent != null){
				fse.remove( parent, function(err){
					if (err){
						mdkLog.ko("A temp folder could not be deleted in " + parent + " : " + err);
					}
					return cb(); // We don't throw any errors, but notify the user
				});
			}
		}
		
	], function(err){
		return callback(); // No errors
	})
	
}

module.exports = cleanTemplate;
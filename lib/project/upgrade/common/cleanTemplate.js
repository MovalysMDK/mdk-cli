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
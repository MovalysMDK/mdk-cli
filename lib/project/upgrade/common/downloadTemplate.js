"use strict";

/**
 * Imports
 */
var AdmZip = require('adm-zip');
var fse = require('fs-extra');
var path = require('path');
var semver = require('semver');
var async = require('async');

var mdkTemplates = require('../../../mdk/templates');
var mdkPath = require('../../../mdkPath')();
var config = require('../../../config');
var network = require('../../../utils/network');
var mdkLog = require('../../../utils/log');


function downloadTemplate( name, targetVersion, callback ){
	
	var snapshotRepo = null;
	var releaseRepo = null;
	var username = null;
	var password = null;
	var root = null;
	var parent = null;
	var zipPath = null;
	var zipFile = null;
	var tmpZipName = null;
	
	async.waterfall([
		
		// Get repository URLs
		function(cb){
			config.getList( ["mdkRepoRelease", "mdkRepoSnapshots", "mdk_login", "mdk_password"], function(err, results){
				if (err){
					return cb(err);
				}
				snapshotRepo = results["mdkRepoSnapshots"];
				releaseRepo = results["mdkRepoRelease"];
				username = results["mdk_login"];
				password = results["mdk_password"];
				return cb();
			});
		},
		
		// Retreive template info
		function(cb){
			mdkTemplates.get( name, false, function(err, item){
				if (err){
					return cb(err);
				}
				return cb(null, item);
			});
		},
		
		// Generate ZIP URL
		function( template, cb ){
			
			async.each( template.versions, function(v, cbVersion){
				
				if ( semver.eq(v.version, targetVersion) ){
					
					// Generate MDK Version
					var mdkVersion;
					if ( 'mdkVersion' in v ){
						mdkVersion = v.mdkVersion;
					}else{
						mdkVersion = v.version;
					}
					
					// Generate ZIP name
					if ( "zipFile" in v ){
						zipFile = v.zipFile;
					} else {
						zipFile = 'mdk-project-' + mdkVersion + '-bin.zip';
					}
					
					// Generate ZIP URL
					if ( "zipPath" in v ){
						zipPath = v.zipPath;
					} else {
						zipPath = (isSnapshot(mdkVersion) ? snapshotRepo : releaseRepo) + '/com/sopragroup/adeuza/movalysfwk/mdk-project/' + mdkVersion + '/';
					}
					return cbVersion(true); // Return with true is not considered as an error in the callback
				}
				
				return cbVersion(); // Return with true is not considered as an error in the callback
				
			}, function(err){
				
				if (err === true){ // Just a way to break the loop, no error
					return cb(null, zipPath + zipFile);
				}else if ( err != null ) { // Here is the error
					return cb(err);
				}else{ // Error too, no URL generated...
					return cb("Could not generate URL for the target template. Please clean your cache using \"mdk cache-clear\" and retry");
				}
			});
		},
		
		// Download ZIP
		function(url, cb){
			
			var currentFormattedDate = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
			tmpZipName = path.join(mdkPath.tmpDir, path.basename( url ) + "__TMP_" + currentFormattedDate + ".zip");
			
			// HTTP request options and parameters
			var options = {
				url: url,
				auth: {
					user: username,
					pass: password
				}
			};
	
			// Download ZIP file
			network.downloadFile(options, tmpZipName, false, function(err) {
				if (err) {
					mdkLog.ko("Error", "An error occurred while downloading the template file: " + err);
					return cb(err);
				}
				else {
					mdkLog.notice("Template downloaded", tmpZipName);
					return cb();
				}
			});
			
		},
		
		// Unzip template, and remove archive
		function( cb ){
			var zip = new AdmZip( tmpZipName );
			parent = path.join(mdkPath.tmpDir, path.basename(tmpZipName).split(/\.zip$/)[0]);
			try{
				zip.extractAllTo( parent, true );
			}catch(e){
				return cb(e + " . ZIP has not been deleted in " + parent);
			}
			
			// Remove reference to ZIP file
			// To be able to remove it without access errors
			zip = null;
			return cb();
		},
		
		// Check root template folder, and return the template root
		// @TODO Be more precise with structure check for a downloaded template
		function( cb ){
			
			fse.readdir( parent, function(err, files){
				if (err){
					return cb(err);
				}
				if ( files.length == 1 && files[0] == zipFile.split('-bin.zip')[0] ) {
					root = path.join(parent, files[0]);
					return cb();
				}else{
					return cb("The template downloaded from MDK repository is not well formatted. Please contact support. ZIP has not been deleted in " + parent);
				}
			});
			
		}
		
		
	], function(err){
		if (err){
			return callback(err);
		}
		return callback( null, root, parent, tmpZipName );
	});
	
}



/**
 * Check if current version is a snapshot
 * @param  {string}  version Version string
 * @return {Boolean}         Whether the version is a Snapshot or not
 */
function isSnapshot( version ) {
    return version.indexOf("-SNAPSHOT", version.length - "-SNAPSHOT".length) !== -1;
}

module.exports = downloadTemplate;
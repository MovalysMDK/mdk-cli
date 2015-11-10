'use strict';

/**
 * Imports
 */
var fse = require('fs-extra');
var path = require('path');

var mdkPath = require('../../mdkPath')();
var mdkLog = require('../../utils/log');

function restore(backupLocation, callback){
	mdkLog.notice('Restore', "Ready For restoration");
	console.log("Backed Up to " + backupLocation);
	
	callback();
}

module.exports = restore;
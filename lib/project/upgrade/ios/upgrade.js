"use strict";

/**
 * Imports
 */

var mdkLog = require("../../../utils/log");


function upgrade(templateTarget, mdkTarget, callback){
	mdkLog.notice("Upgrading iOS");
	return callback();
}

module.exports = upgrade;
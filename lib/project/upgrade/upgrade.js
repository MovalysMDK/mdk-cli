'use strict';

/**
 * Imports
 */



function upgrade(target, cb){
	console.log("Upgrading to " + target);
	cb();
}


module.exports = upgrade;
'use strict';

function userHome() {
	if (/^win/.test(process.platform)){
		return process.env.USERPROFILE || process.env.HOME;
	}
    return process.env.HOME || process.env.USERPROFILE;
}

module.exports = userHome;
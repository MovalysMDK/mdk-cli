"use strict"

var fs = require('fs-extra');

function hasOverride( conf, callback ) {

    var customDir = "custom_" + conf.platformName;
    fs.exists(customDir, function(exists) {
        conf.project.hasCustomDir = exists;
        if ( exists ) {
            console.log("  custom directory found");
            conf.project.customDir = customDir;
        }

        callback();
    });
}

module.exports = hasOverride;
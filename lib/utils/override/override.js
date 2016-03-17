"use strict"

var fs = require('fs-extra')
var path = require('path');

var runAsync = require('../runAsync');
var hasOverride = require('./hasOverride');

var replace = require("replace");

function override( conf, callback ) {

    hasOverride(conf, function(err) {
        if ( conf.project.hasCustomDir ) {
            fs.exists(path.join(conf.project.customDir, "custom.js"), function(exists) {
                if ( exists ) {
                    var custom = require( path.join(process.cwd(), conf.project.customDir,'custom.js'));
                    var utils = {
                        "replace":replace,
                        "fs": require('fs'),
                        "mdkRegExp": require('./mdkRegExp'),
                        "copyFile": require('../io/copyFile')
                    }
                    // Require('') doesnot work in custom.js, so we pass it a util parameter containing modules.
                    console.log("  run custom js");
                    custom(utils);
                }


                var source = conf.project.customDir;
                var dest = ".";
                fs.copy( source, dest, callback );
            });
        } else {
            callback();
        }
    });
}

module.exports = override;
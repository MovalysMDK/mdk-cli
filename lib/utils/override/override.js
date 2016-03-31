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

var fs = require('fs-extra');
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
                    };
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
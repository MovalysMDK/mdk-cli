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
'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');
var mdkLog = require('../../utils/log');

var buildIpa = require('../../utils/deploy/buildIpa');

/**
 * Deploy ios app.
 * @param projectConf project configuration
 * @param toolSpecs dev tools specification
 * @param osName os name
 * @param callback callback
 */
function deploy( projectConf, toolSpecs, osName, callback ) {
    if (!projectConf.project.buildDisable) {
    var minor = /[0-9]*\.[0-9]*/g.exec(projectConf.project.mdkVersion)[1];

        var curDir = process.cwd();
        // build ipa
        buildIpa(projectConf,
                curDir + '/ios/build/Build/Products/Debug-iphoneos/' + projectConf.project.artifactId + '.app',
                curDir + '/ios/build',
                path.join(process.cwd(),'iosDeploy', minor, projectConf.project.artifactId),
                'https://nansrvintc2.ntes.fr.sopra/apps/ios-native/' + minor,  function (err) {
                    if (!err) {
                        mdkLog.ok('deploy on iosDeploy' , 'success');
                    }
                    callback();
                });
    } else {
        callback();
    }
}

module.exports = deploy;
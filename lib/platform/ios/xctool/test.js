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

var spawn = require('../../../utils/system');
var getXctoolCmd = require('./getXctoolCmd');

/**
 * Run test on project
 * @param projectConf project configuration
 * @param callback callback
 */
function build(projectConf, toolSpecs, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    getXctoolCmd( toolSpecs, function(err, xctoolCmd) {
        if (err) {
            callback(err);
        }
        else {
            var xctoolBuildArgs = [
                '-workspace',
                projectConf.project.artifactId + '.xcworkspace',
                '-scheme',
                projectConf.project.artifactId,
                '-sdk',
                'iphonesimulator',
                '-derivedDataPath',
                './build',
                '-reporter',
                'junit:./junit-report.xml',
                'test'
            ];

            spawn(xctoolCmd, xctoolBuildArgs, function(err) {
                if ( err ) {
                    callback(err);
                }
                else {
                    callback();
                    //TODO: spawn("sh", ['computeCoverage.sh'], callback );
                }
            });
        }
    });
}
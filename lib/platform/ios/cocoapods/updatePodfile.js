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

var fs = require('fs-extra');
var assert = require('assert');
var async = require('async');
var path = require('path');

var config = require('../../../config');
var system = require('../../../utils/system');
var replaceInFile = require('../../../utils/io/replaceInFile');
var isSnapshot = require('../../../utils/semversion/isSnapshot');

/**
 * Update podfile with mdk-cli configuration.
 * Only used in development mode.
 * @param projectConf project configuration
 * @param callback callback
 */
function updatePodfile( projectConf, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof callback, 'function');

    // if mdk version is a snapshot, replace version number with :head
    if ( isSnapshot(projectConf.project.mdkVersion)) {
        
        process.chdir('ios');

        async.waterfall([
                function(cb) {
                    config.get("mdkRepoGit", cb);
                },
                function(repoGitUrl, cb) {
                    var findRg = "(pod\\s+'MFCore'\\s*,\\s*)'[0-9\\.]+'";
                    var mfcoreRepo = computeRepoUrl("mdk-ios-lib-core.git", repoGitUrl );
                    replaceInFile("Podfile", findRg, "$1:git => '" + mfcoreRepo + "'", function(err) {
                        cb(err, repoGitUrl);
                    });
                },
                function(repoGitUrl, cb) {
                    var findRg = "(pod\\s+'MFUI'\\s*,\\s*)'[0-9\\.]+'";
                    var mfuiRepo = computeRepoUrl("mdk-ios-lib-ui.git", repoGitUrl );
                    replaceInFile("Podfile", findRg, "$1:git => '" + mfuiRepo + "'", function(err) {
                        cb(err, repoGitUrl);
                    });
                },
                function(repoGitUrl, cb) {
                    var findRg = "(pod\\s+'MDKControl'\\s*,\\s*)'[0-9\\.]+'";
                    var mdkcontrolRepo = computeRepoUrl("mdk-ios-control.git", repoGitUrl );
                    replaceInFile("Podfile", findRg, "$1:git => '" + mdkcontrolRepo + "'", function(err) {
                        cb(err, repoGitUrl);
                    });
                }
            ],
            function(err) {
                process.chdir('..');
                callback(err);
            });
    }
    else {
        callback(null);
    }
}

/**
 * Compute repository url
 * @param repoName repository name
 * @param gitBaseUrl base url of git
 */
function computeRepoUrl( repoName, gitBaseUrl ) {

    assert.equal(typeof repoName, 'string');
    assert.equal(typeof gitBaseUrl, 'string');

    var repoUrl = gitBaseUrl;
    // if git http or https
    if ( repoUrl.indexOf("http") === 0 ) {
        // ensure url ends with slash.
        if (repoUrl.charAt(repoUrl.length - 1) !== '/') {
            repoUrl += "/";
        }
    }
    // else git ssh
    else {
        // ensure url ends with ':'
        if (repoUrl.charAt(repoUrl.length - 1) !== ':') {
            repoUrl += ":";
        }
    }
    repoUrl += repoName ;
    return repoUrl;
}

module.exports = updatePodfile ;
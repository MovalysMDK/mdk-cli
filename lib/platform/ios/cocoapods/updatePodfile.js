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
 * @param projectConf project configuration
 * @param callback callback
 */
function updatePodfile( projectConf, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof callback, 'function');

    process.chdir('ios');

    async.waterfall([
            function(cb) {
                config.get("mdkRepoGit", cb);
            },
            function( repoGitUrl, cb) {
                var podSpecRepo = computeRepoUrl("podspecs.git", repoGitUrl );
                replaceInFile("Podfile", "gitmovalys@git.ptx.fr.sopra:podspecs.git", podSpecRepo, function(err) {
                    cb(err, repoGitUrl);
                });
            },
            function(repoGitUrl, cb) {
                // if mdk version is a snapshot, replace version number with :head
                if ( isSnapshot(projectConf.project.mdkVersion)) {
                    var findRg = "(pod\\s+'MFCore'\\s*,\\s*)'[0-9\\.]+'";
                    var mfcoreRepo = computeRepoUrl("mfcore.git", repoGitUrl );
                    replaceInFile("Podfile", findRg, "$1:git => '" + mfcoreRepo + "', :branch => 'Cotopaxi'", function(err) {
                        cb(err, repoGitUrl);
                    });
                }
                else {
                    cb(null, repoGitUrl);
                }
            },
            function(repoGitUrl, cb) {
                // if mdk version is a snapshot, replace version number with :head
                if ( isSnapshot(projectConf.project.mdkVersion)) {
                    var findRg = "(pod\\s+'MFUI'\\s*,\\s*)'[0-9\\.]+'";
                    var mfuiRepo = computeRepoUrl("mfui.git", repoGitUrl );
                    replaceInFile("Podfile", findRg, "$1:git => '" + mfuiRepo + "', :branch => 'Cotopaxi'", function(err) {
                        cb(err, repoGitUrl);
                    });
                }
                else {
                    cb(null, repoGitUrl);
                }
            }
        ],
        function(err) {
            process.chdir('..');
            callback(err);
        });
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
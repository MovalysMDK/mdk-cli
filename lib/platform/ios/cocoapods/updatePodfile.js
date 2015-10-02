'use strict';

var fs = require('fs-extra');
var assert = require('assert');
var async = require('async');
var path = require('path');

var config = require('../../../config');
var system = require('../../../utils/system');
var replaceInFile = require('../../../utils/io/replaceInFile');


/**
 * Update podfile with mdk-cli configuration.
 * @param callback callback
 */
function updatePodfile(callback) {

    assert.equal(typeof callback, 'function');

    process.chdir('ios');

    async.waterfall([
            function(cb) {
                config.get("mdkRepoGit", cb);
            },
            function( repoGitUrl, cb) {
                replaceInFile("Podfile", "gitmovalys@git.ptx.fr.sopra:podspecs.git", repoGitUrl + "/podspecs.git", cb);
            }
        ],
        function(err) {
            process.chdir('..');
            callback(err);
        });
}


module.exports = updatePodfile ;
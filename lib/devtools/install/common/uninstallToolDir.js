'use strict';
var removeInstallDir = require('./removeInstallDir');
var config = require('../../../config');
var async = require('async');

var assert = require('assert');
/**
 *
 * @param toolSpec Tool specs of tool to uninstall
 * @param removeDependencies Indicates if dependencies should be removed too
 * @param callback Callback
 */
function uninstallDir(toolSpec, removeDependencies, callback) {

    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof removeDependencies, 'boolean');
    assert.equal(typeof callback, 'function');


    async.waterfall([
        function(cb) {
            // Remove installDir
            removeInstallDir(toolSpec, cb);
        },
        function(cb) {
            // del config
            config.del("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
        }
    ], function(err) {
        callback(err);

    });
}

module.exports = uninstallDir;
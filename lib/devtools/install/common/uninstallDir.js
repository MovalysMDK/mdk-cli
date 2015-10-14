'use strict';
var removeInstallDir = require('./removeInstallDir');
var config = require('../../../config');
var async = require('async');

function uninstallDir(toolSpec, removeDependencies, callback) {

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
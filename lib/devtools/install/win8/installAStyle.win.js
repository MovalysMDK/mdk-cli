"use strict";

var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var assert = require('assert');
var moment = require('moment');

var checkAStyleVersion = require('../../check/win8/astyle/checkAStyleVersion');

var mdkpath = require('../../../mdkpath');
var extract = require('../../../utils/extract');
var system = require('../../../utils/system');
var config = require('../../../config');
var uninstallDir = require('../common/uninstallToolDir');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param toolSpec tool specification
     * @param devToolsSpec devtools specification
     * @param platform platform name
     * @param osName os name
     * @param callback callback
     */
    check: function( toolSpec, devToolsSpec, platform, osName, callback ) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof devToolsSpec, 'object');
        assert.equal(typeof platform, 'string');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        async.waterfall( [
            function (cb) {
                // read configuration to known where AStyle is installed.
                config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", function(err, installDir ) {
                    if (err || typeof installDir === 'undefined') {
                        cb("Not installed");
                    }
                    else {
                        cb(null, installDir);
                    }
                });
            },
            function (installDir, cb) {
                // check AStyle version
                checkAStyleVersion( toolSpec.version, installDir, cb);
            }
        ], function(err) {
            if ( err ) {
                callback(false, err);
            }
            else {
                // all checks passed, don't need to reinstall
                callback(true);
            }
        });
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>delete old directory if exists</li>
     *     <li>install products in directory $MDK_HOME/tools/apache-AStyle-version.</li>
     * </ul>
     * @param toolSpec toolSpec
     * @param osName os name
     * @param callback callback
     */
    install: function( toolSpec, osName, callback) {

        assert.equal(typeof toolSpec, 'object');
        assert.equal(typeof osName, 'string');
        assert.equal(typeof callback, 'function');

        var mdkPaths = mdkpath();
        var archiveFile = toolSpec.packages[0].cacheFile;
        toolSpec.opts.installDir = path.join(mdkPaths.toolsDir,"AStyle","bin");  
        async.waterfall([
            function(cb) {
                console.log("  extract archive");
                extract.unzip(archiveFile, mdkPaths.toolsDir, cb);
            },
            function(cb) {
                // save install directory in config
                config.set("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", toolSpec.opts.installDir, cb);
            },
        ], function(err) {
            callback(err);
        });
    },

    /**
     * Remove tool
     * @param toolSpec toolSpec
     * @param callback callback
     */
    uninstall: function( toolSpec, removeDependencies, callback) {
        uninstallDir(toolSpec, removeDependencies, callback);
    }

};
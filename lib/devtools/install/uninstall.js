'use strict';

var async = require('async');
var path = require('path');
var semver = require('semver');
var fs = require('fs-extra');
var assert = require('assert');
var clc = require('cli-color');
var checks = require('../check');

var mdkpath = require('../../mdkpath');
var system = require('../../utils/system');
var devToolsSpecs = require('../specs');
var osName = require('../../utils/system/osName');
var config = require('../../config');
var checkPlatform = require('../check/common/checkPlatform');

/**
 * Uninstall tools required by mdk for platform.
 * @param platform platform target (android,ios)
 * @param mdkVersion mdk version
 * @param callback
 */
function uninstall( platform, mdkVersion, removeDependencies, callback ) {

    assert.equal(typeof platform, 'string');
    assert.ok(semver.valid(mdkVersion), mdkVersion + " is not a valid version.");
    assert.equal(typeof callback, 'function');

    var mdkPaths = mdkpath();

    console.log(clc.bold("Uninstall environment for MDK " + platform + " " + mdkVersion));
    console.log("");

    async.waterfall( [
        function (cb) {
            // compute os name.
            osName( function(err, name ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb(null, name);
                }
            });
        },
        function(osName, cb) {
            // check platform is compatible with current os.
            checkPlatform(platform, function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, osName);
                }
            });
        },
        function(osName, cb) {
            // retrieve devTools specification.
            devToolsSpecs.get(mdkVersion, false, function(err, devToolsSpec) {
                if (err) {
                    cb(err);
                }
                else {
                    process.env.GEM_HOME = path.join(mdkPaths.toolsDir, 'gems-'+devToolsSpec.version, 'lib');
                    cb(null, devToolsSpec, osName);
                }
            });
        },
        function(devToolsSpec, osName, cb) {
            // check minimal required version of mdk-cli
            fs.readJson(path.join(__dirname, '..', '..', '..', 'package.json'), function (err, result) {
                if( !err ) {
                    if ( semver.gte(result.version, devToolsSpec.mdk_cli.minVersion)) {
                        cb(null, devToolsSpec, osName);
                    }
                    else {
                        cb('mdk-cli version ' + devToolsSpec.mdk_cli.minVersion + ' is required by mdk ' + mdkVersion);
                    }
                }
                else {
                    cb(err);
                }
            });
        },
        function(devToolsSpecs, osName, cb) {
            // proceed uninstall
            uninstallTools(devToolsSpecs, platform, osName, mdkVersion, removeDependencies, cb);
        }
    ], function(err) {
        callback(err);
    });
}

/**
 * Proceed uninstallation of products.
 * @param devToolsSpecs
 * @param platform
 * @param osName
 * @param mdkVersion
 * @param removeDependencies
 * @param callback
 */
function uninstallTools(devToolsSpecs, platform, osName, mdkVersion, removeDependencies, callback) {

    assert.equal(typeof callback, 'function');
    // Compute list of tools to uninstall.
    computeToolListToUninstall(devToolsSpecs, platform, osName, mdkVersion, function(err, toolSpecs) {
        if ( err ) {
            callback(err);
        }
        else {
            if ( toolSpecs.length > 0 ) {
                async.eachSeries(toolSpecs, function(missingToolSpec, cb) {
                    console.log(clc.green.underline("Uninstall " + missingToolSpec.name + " v" + missingToolSpec.version));

                    // backup current dir
                    var currentDir = process.cwd();
                    missingToolSpec.mdkVersion = mdkVersion;
                    var script = require("./" + missingToolSpec.script + "." + osName);
                    script.uninstall(missingToolSpec, removeDependencies, function(err) {
                        // restore current dir
                        process.chdir(currentDir);

                        if ( err ) {
                            cb(err);
                        }
                        else {
                            cb();
                        }
                    });

                }, callback);
            }
            else {
                callback();
            }
        }
    });
}

/**
 * @param devToolsSpec
 * @param platform
 * @param callback
 */
function computeToolListToUninstall(devToolsSpec, platform, osName, mdkVersion, callback ) {

    assert.equal(typeof callback, 'function');

    var toolsToUninstall = [];
    var requiredSpace = 0 ;

    async.eachSeries(devToolsSpec.install, function(toolSpec, cb) {

        if ( (!toolSpec.platforms || toolSpec.platforms.indexOf(platform) != -1 ) &&
            (!toolSpec.os || toolSpec.os.indexOf(osName) != -1)) {
            var script = require("./" + toolSpec.script + "." + osName );
            toolSpec.mdkVersion = mdkVersion;
            toolSpec.opts.workDir = mdkpath().tmpDir;
            toolsToUninstall.push(toolSpec);

        }
        cb();
    }, function (err, results) {
        callback(err, toolsToUninstall);
    });
}



module.exports = uninstall;
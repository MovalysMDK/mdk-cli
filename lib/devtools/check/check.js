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

var async = require('async');
var path = require('path');
var semver = require('semver');
var fs = require('fs-extra');
var assert = require('assert');
var clc = require('cli-color');

var system = require('../../utils/system');
var network = require('../../utils/network');
var devToolsSpecs = require('../specs');
var osName = require('../../utils/system/osName');
var mdkLog = require('../../utils/log');
var config = require('../../config');
var checkPlatform = require('./common/checkPlatform');
var url = require('url');

/**
 * Install tools required by mdk for platform.
 * @param platform platform target (android,ios,html5,win8)
 * @param mdkVersion mdk version
 * @param callback
 */
function check( platform, mdkVersion, onlyPrerequisite, callback ) {

    assert.equal(typeof platform, 'string');
    assert.equal(typeof mdkVersion, 'string');
    assert.equal(typeof onlyPrerequisite, 'boolean');
    assert.equal(typeof callback, 'function');

    if(onlyPrerequisite) {
        console.log("Check prerequisite tools for MDK " + platform + " " + mdkVersion);
    }
    else {
        console.log(clc.bold("Check environment for MDK " + platform + " " + mdkVersion));
    }

    async.waterfall( [
        function (cb) {
            network.findProxy(function(err, proxy) {
                if ( typeof proxy !== "undefined") {
                    var proxyParse = url.parse(proxy);
                    console.log("Proxy detected. Using : " + proxyParse.protocol+"//"+proxyParse.hostname+":"+proxyParse.port);
                } else {
                    console.log("No proxy detected.");
                }
                console.log("");
                cb();
            });
        },
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
            // proceed checks
            checkEnv(devToolsSpecs, platform, osName, onlyPrerequisite,  cb);
        }
    ], function(err) {
        callback(err);
    });
}

/**
 * Check environnement is ok (tools, auth,...).
 * @param devToolsSpecs devTools specification
 * @param platform mobile platforme
 * @param osName os name
 * @param callback callback
 */
function checkEnv(devToolsSpecs, platform, osName, onlyPrerequisite,  callback) {

    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof onlyPrerequisite, 'boolean');
    assert.equal(typeof callback, 'function');

    // backup current dir
    var currentDir = process.cwd();

    var error = false;

    // Loop over checks
    async.eachSeries(devToolsSpecs.checks, function(check, cb) {
        var passcheck = true;
        if(onlyPrerequisite) {
            passcheck = check.prerequisite;
        }

        // Test if checks is compatible with os and for specified mobile platform.
        if ( (!check.platforms || check.platforms.indexOf(platform) != -1 ) &&
            (!check.os || check.os.indexOf(osName) != -1) && passcheck) {

            // load check script.
            var script = require("./" + check.script );
            if ( script.check ) {
                script = script.check ;
            }
            // Execute script.
            script(check, devToolsSpecs, osName, platform, function( checkOk ) {

                // restore current dir
                process.chdir(currentDir);

                if ( !checkOk ) {
                    error = true;
                    if(check.prerequisite && onlyPrerequisite) {
                        cb(error);
                    }
                }
                cb();
            });
        }
        else {
            cb();
        }
    }, function(err){
        if ( error ) {
            callback("At least, one check failed. Fix them before using mdk.");
        } else {
            callback();
        }
    });
}

module.exports = check;
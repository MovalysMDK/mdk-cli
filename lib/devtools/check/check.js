'use strict'

var async = require('async');
var path = require('path');
var semver = require('semver');
var fs = require('fs-extra');
var assert = require('assert');

var system = require('../../utils/system');
var devToolsSpecs = require('../specs');
var osName = require('../../utils/system/osName');
var config = require('../../config');

/**
 * Install tools required by mdk for platform.
 * @param platform platform target (android,ios)
 * @param mdkVersion mdk version
 * @param callback
 */
function check( platform, mdkVersion, callback ) {

    assert.equal(typeof platform, 'string');
    assert.equal(typeof mdkVersion, 'string');
    assert.equal(typeof callback, 'function');

    console.log("Check environment for MDK " + platform + " " + mdkVersion);
    console.log("");

    async.waterfall( [
        function (cb) {
            config.get("devToolsBaseDir", function(err, baseDir) {
                if(err) {
                    cb(err)
                }
                else {
                    process.env['GEM_HOME'] = path.join(baseDir, 'gems-'+mdkVersion, 'lib');
                    cb();
                }
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
            checkPlatform(platform, osName, function(err) {
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
            })
        },
        function(devToolsSpecs, osName, cb) {
            // proceed checks
            checkEnv(devToolsSpecs, platform, osName, cb);
        }
    ], function(err) {
        callback(err);
    });
}

/**
 * Check platform is valid :
 * <ul>
 *     <li>Is one of the following values : android, ios</li>
 *     <li>Is supported by the os => android:[osx, windows], ios:[osx]</li>
 * </ul>
 * @param platform platform
 * @param callback
 */
function checkPlatform( platform, osName, callback) {

    assert.equal(typeof callback, 'function');

    switch(platform) {
        case 'ios':
            system.isWin(function (isWin) {if(isWin) {callback('iOS is not suppodrted on Windows platform')}} );
            system.isLinux(function (isLinux) {if(isLinux){callback('iOS is not supported on Linux platform')}});
            callback();
            break;
        case 'android':
            //Supported everwhere
            callback();
            break;
        default:
            callback("Unrecognized platform : '" + platform + "'");
            break;
    }
}

/**
 * Check environnement is ok (tools, auth,...).
 * @param devToolsSpecs devTools specification
 * @param platform mobile platforme
 * @param osName os name
 * @param callback callback
 */
function checkEnv(devToolsSpecs, platform, osName, callback) {

    assert.equal(typeof callback, 'function');

    // backup current dir
    var currentDir = process.cwd();

    var error = false;

    // Loop over checks
    async.each(devToolsSpecs.checks, function(check, cb) {

        // Test if checks is compatible with os and for specified mobile platform.
        if ( (!check.platforms || check.platforms.indexOf(platform) != -1 ) &&
            (!check.os || check.os.indexOf(osName) != -1)) {

            // load check script.
            var script = require("./" + check.script );

            // Execute script.
            script.check(check, devToolsSpecs, osName, platform, function( checkOk ) {

                // restore current dir
                process.chdir(currentDir);

                if ( !checkOk ) {
                    error = true;
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
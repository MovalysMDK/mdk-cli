'use strict';

var async = require('async');
var path = require('path');
var semver = require('semver');
var diskspace = require('diskspace');
var fs = require('fs-extra');
var assert = require('assert');
var clc = require('cli-color');
var checks = require('../check');
var read = require('read');


var system = require('../../utils/system');
var devToolsSpecs = require('../specs');
var osName = require('../../utils/system/osName');
var config = require('../../config');
var checkPlatform = require('../check/common/checkPlatform');
var downloadPackages = require('./downloadPackages');
var defineProxyEnv = require('../../utils/network/defineProxyEnv');
var mdkpath = require('../../mdkpath');

/**
 * Install tools required by mdk for platform.
 * @param platform platform target (android,ios)
 * @param mdkVersion mdk version
 * @param acceptLicenses A Boolean that indicated id thrid-party tools licenses will be automatically agreed
 * @param callback
 */
function install( platform, mdkVersion, acceptLicenses, callback ) {

    assert.equal(typeof platform, 'string');
    assert.ok(semver.valid(mdkVersion), mdkVersion + " is not a valid version.");
    assert.equal(typeof callback, 'function');

    var mdkPaths = mdkpath();

    console.log(clc.bold("Install environment for MDK " + platform + " " + mdkVersion));
    console.log("");

    async.waterfall( [
        function (cb) {
            // start prerequisite checks.
            checks.check( platform, mdkVersion, true, cb);
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
        function (devToolsSpecs, osName, cb) {
            // define proxy environment variables.
            defineProxyEnv(function(err) {
                cb(err, devToolsSpecs, osName);
            });
        },
        function(devToolsSpecs, osName, cb) {
            // proceed install
            installTools(devToolsSpecs, platform, osName, mdkVersion, acceptLicenses, cb);
        }
    ], function(err) {
        callback(err);
    });
}

/**
 * Proceed installation of products.
 * <ul>
 *     <li>Check available disk space.</li>
 * </ul>
 * @param devToolsSpecs toolSpecs of tools to install
 * @param platform The platform to install tools
 * @param osName OS Name where to tools will be installed
 * @param acceptLicenses A Boolean that indicated id thrid-party tools licenses will be automatically agreed
 * @param callback The callback
 */
function installTools(devToolsSpecs, platform, osName, mdkVersion, acceptLicenses, callback) {

    assert.equal(typeof callback, 'function');

    // Compute list of tools to install.
    computeToolListToInstall(devToolsSpecs, platform, osName, mdkVersion, function(err, missingToolSpecs) {
        if ( err ) {
            callback(err);
        }
        else {
            if ( missingToolSpecs.length > 0 ) {
                checkLicenses(missingToolSpecs, acceptLicenses, function(err) {
                    if(err) {
                        callback(err);
                    }
                    else {
                        async.eachSeries(missingToolSpecs, function(missingToolSpec, cb) {
                            console.log(clc.green.underline("Install " + missingToolSpec.name + " v" + missingToolSpec.version));

                            downloadPackages(devToolsSpecs, missingToolSpec, mdkVersion, function (err) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    cleanWorkDir(missingToolSpec, function (err) {
                                        if ( err ) {
                                            cb(err);
                                        }
                                        else {
                                            // backup current dir
                                            var currentDir = process.cwd();
                                            missingToolSpec.mdkVersion = mdkVersion;

                                            var scriptName = missingToolSpec.script ;
                                            if ( typeof missingToolSpec.os !== "undefined" ) {
                                                scriptName += "." +  osName ;
                                            }
                                            var script = require("./" + scriptName );

                                            script.install(missingToolSpec, function(err) {
                                                // restore current dir
                                                process.chdir(currentDir);
                                                console.log("");

                                                if ( err ) {
                                                    cb(err);
                                                }
                                                else {
                                                    writeInstallVersion(missingToolSpec, function(err) {
                                                        if (err) {
                                                            cb(err);
                                                        }
                                                        else {
                                                            cb();
                                                        }
                                                    });
                                                }
                                            });
                                        }

                                    });
                                }
                            });

                        }, callback);
                    }
                });
            }
            else {
                callback();
            }
        }
    });
}

/**
 * Check for missing tools.
 * @param devToolsSpec tools specification
 * @param platform platform
 * @param osName os name
 * @param mdkVersion mdk version
 * @param callback callback
 */
function computeToolListToInstall(devToolsSpec, platform, osName, mdkVersion, callback ) {

    assert.equal(typeof devToolsSpec, 'object');
    assert.equal(typeof platform, 'string');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof mdkVersion, 'string');
    assert.equal(typeof callback, 'function');

    var toolsToInstall = [];
    var requiredSpace = 0 ;

    async.eachSeries(devToolsSpec.install, function(toolSpec, cb) {

        if ( (!toolSpec.platforms || toolSpec.platforms.indexOf(platform) != -1 ) &&
            (!toolSpec.os || toolSpec.os.indexOf(osName) != -1)) {

            var scriptName = toolSpec.script ;
            if ( typeof toolSpec.os !== "undefined" ) {
                scriptName += "." +  osName ;
            }
            var script = require("./" + scriptName );

            toolSpec.mdkVersion = mdkVersion;
            script.check(toolSpec, devToolsSpec, platform, osName, function( installOk, err ) {

                    if ( !installOk ) {
                        toolsToInstall.push(toolSpec);
                        if ( err === "update") {
                            console.log(clc.yellow('[WN] ') + clc.bold(toolSpec.name) + " " + toolSpec.version + " already installed. Will search for updates.");
                        }
                        else {
                            console.log(clc.red('[KO] ') + clc.bold(toolSpec.name) + " " + toolSpec.version + " : " + err );
                            requiredSpace += toolSpec.diskSpace;
                        }
                        cb();
                    }
                    else {
                        // check installVersion
                        checkInstallVersion( toolSpec, function(err, mustReinstall ) {
                            if ( err ) {
                                cb(err);
                            }
                            else {
                                if (mustReinstall) {
                                    console.log(clc.red('[KO] ') + clc.bold(toolSpec.name) + " " + toolSpec.version + " needs to be reinstalled." );
                                    script.uninstall( toolSpec, true, function(err) {
                                        // ignore uninstall error.
                                        toolsToInstall.push(toolSpec);
                                        cb();
                                    });
                                }
                                else {
                                    console.log(clc.green('[OK] ') + clc.bold(toolSpec.name) + " " + toolSpec.version + " is already installed." );
                                    cb();
                                }
                            }
                        });
                    }
                }
            );
        }
        else {
            cb();
        }
    }, function(err){
        if( err ) {
            callback(err);
        } else {
            checkEnoughSpace(requiredSpace, function(err) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, toolsToInstall);
                }
            });
        }
    });
}


/**
 * Check there is enough space on disk to install missing tools.
 * @param requiredSpace require free space.
 * @param callback callback
 */
function checkEnoughSpace(requiredSpace, callback) {

    assert.equal(typeof callback, 'function');

    console.log("Required free space: " + requiredSpace + " Mo");
    console.log("");

    diskspace.check(mdkpath().homeDir, function (err, total, free, status)
    {
        if (err ) {
            callback(err);
        }
        else {
            if ( requiredSpace >= ( free / 1024/ 1024 ) ) {
                callback("Not enough space. At least " + requiredSpace+ " Mo is needed.");
            }
            else {
                callback();
            }
        }
    });
}

/**
 * Clean workdir.
 * <p>Delete all contents and recreate a new one.</p>
 * @param toolSpec install specification of tool
 * @param callback
 */
function cleanWorkDir( toolSpec, callback ) {

    assert.equal(typeof callback, 'function');

    // working directory
    toolSpec.opts.workDir = mdkpath().tmpDir;

    // remove work dir
    fs.remove( toolSpec.opts.workDir, function(err) {

        if ( err ) {
            callback(err);
        }
        else {
            // recreate workdir
            fs.mkdirs(toolSpec.opts.workDir, callback);
        }
    });
}

/**
 * Check the installer version.
 * <p>If install version has upgraded, a reinstall is needed.</p>
 * @param toolSpec toolSpec
 * @param callback callback
 */
function checkInstallVersion(toolSpec, callback ) {

    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // read configuration to known where tool is installed.
            config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
        },
        function(installDir, cb) {

            var installVersionFile = path.join( installDir, toolSpec.name + "-" + toolSpec.version + ".installVersion");
            fs.readFile( installVersionFile, function(err, currentInstallVersion ) {
                if ( err) {
                    cb(null, true);
                }
                else {
                    cb(null, toolSpec.installVersion > currentInstallVersion);
                }
            });
        }
    ], function(err, reInstall) {
        if ( err) {
            callback(err);
        }
        else {
            callback(null, reInstall);
        }
    });
}

/**
 * Check the installer version.
 * <p>If install version has upgraded, a reinstall is needed.</p>
 * @param toolSpec toolSpec
 * @param callback callback
 */
function writeInstallVersion(toolSpec, callback ) {

    assert.equal(typeof toolSpec, 'object');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function (cb) {
            // read configuration to known where tool is installed.
            config.get("tools_" + toolSpec.name + "_" + toolSpec.version + "_installDir", cb);
        },
        function(installDir, cb) {
            var installVersionFile = path.join( installDir, toolSpec.name + "-" + toolSpec.version + ".installVersion");
            fs.writeFile( installVersionFile, toolSpec.installVersion, function(err ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        }
    ], function(err) {
        if ( err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

/**
 * Checks if missing tools to install require licenses. If they do, ask the user to accept licenses.
 * @param missingToolsSpecs The missing tools to install
 * @param acceptLicenses A Boolean that indicated id thrid-party tools licenses will be automatically agreed
 * @param callback The callback
 */
function checkLicenses(missingToolsSpecs, acceptLicenses, callback) {
    var licenses = [];

    assert(typeof missingToolsSpecs, 'array');
    assert(typeof callback, 'function');


    //Check for licenses
    missingToolsSpecs.forEach(function (toolSpec) {
        if (typeof toolSpec.licenses != 'undefined') {
            toolSpec.licenses.forEach(function (license) {
                licenses.push(license);
            });
        }
    });

    //If licenses needs to be accepted, ask the user.
    if(licenses.length > 0 ) {
        if(acceptLicenses) {
            var infoText = clc.bold.red("The following licenses will be automatically agreed.\n");
            licenses.forEach(function (license) {
                infoText = infoText + clc.bold("* " + license.name + "\n");
                infoText = infoText + clc.blue.underline(license.url + "\n\n");
            });
            console.log(infoText);
            console.log(clc.green.bold('[OK]') + " Licenses agreed\n");
            callback(null);
        }
        else {
            var promptText = clc.bold.red("The following licenses will be automatically agreed. Continue ? (Yes/No)\n");
            licenses.forEach(function (license) {
                promptText = promptText + clc.bold("* " + license.name + "\n");
                promptText = promptText + clc.blue.underline(license.url + "\n\n");
            });
            promptText = promptText + "(Yes/No) >>>";
            read({prompt: promptText, silent: false}, function (err, result) {
                if (result === 'Y' || result === "YES" || result === 'yes' || result === "Yes" || result === 'y') {
                    console.log(clc.green.bold('[OK]') + " Licenses agreed\n");
                    callback(null);
                }
                else {
                    callback("You need to agree with licenses above to install missing tools.");
                }
            });
        }
    }
    else {
        callback();
    }
}

module.exports = install;
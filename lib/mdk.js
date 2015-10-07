'use strict';

var program = require('commander');
var assert = require('assert');
var clc = require('cli-color');

var config = require('./config');
var versions = require('./versions');
var cache = require('./cache');
var devtools = require('./devtools');
var devtoolsCheck = require('./devtools/check');
var userProject = require('./project');
var platform = require('./platform');
var user = require('./user');

function mdkThis() {

    program
        .version('1.0.0');

    // CONFIG -----------------------------------------------------------------
    program
        .command('config-get <key>')
        .description('get configuration value parameter key.')
        .action(function (key) {
            config.displayValue(key, function (err) {
                if (err) {
                    exitWithMessage(err, 1);
                }
            });

        }).on('--help', function () {
        });

    program
        .command('config-set <key> <value>')
        .description('set configuration value for parameter key.')
        .action(function (key, value) {
            config.set(key, value, function (err) {
                if (err) {
                    exitWithMessage('Error setting parameter "' + key + '" with value : "' + value + '"' + err, 1);
                }
                else {
                    exitWithMessage('Parameter "' + key + '" updated with value : "' + value + '".', 0);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('config-list')
        .description('show configuration values')
        .action(function () {
            config.displayAll(function (err) {
                if (err) {
                    exitWithMessage('Error retrieving list of parameters: ' + err, 1);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('config-del <key>')
        .description('remove configuration value for parameter <key>')
        .action(function (key) {
            config.del(key, function (err, value) {
                if (err) {
                    exitWithMessage(err, 1);
                }
                else {
                    exitWithMessage('Parameter "' + key + '" deleted from user configuration file.', 0);
                }
            });
        }).on('--help', function () {
        });


    // VERSIONS -----------------------------------------------------------------

    program
        .command('version-list')
        .description('show all versions of MDK')
        .action(function (err, list) {
            versions.list(function (err, list) {
                if (err) {
                    exitWithMessage('Failure reading version list: ' + err, 1);
                }
                else {
                    //Check Result
                    assert.equal(typeof list, 'object');

                    //Display result
                    console.log(clc.bold('MDK Versions :'));
                    list.versions.forEach(function (item) {
                        console.log(item.version);
                    });
                    process.exit(0);
                }
            });

        }).on('--help', function () {
        });

    program
        .command('version-last')
        .description('show last version of MDK')
        .action(function (err, last) {
            versions.lastVersion(function (err, last) {
                if (err) {
                    exitWithMessage('Failure reading last version: ' + err, 1);
                }
                else {
                    //Check Result
                    assert.equal(typeof last, 'string');

                    console.log(clc.bold('MDK Last Version : ') + last);
                    process.exit(0);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('version-get <version>')
        .description('show infos of MDK with version <version> ')
        .action(function (version) {
            versions.get(version, false, function (err, result) {
                if (err) {
                    exitWithMessage('Failure reading version: ' + err, 1);
                }
                else {
                    //Check Result
                    assert.equal(typeof result, 'object');


                    versions.display(result, process.exit);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('version-update')
        .description('update version list')
        .action(function () {
            console.log("get");
        }).on('--help', function () {
        });

    // DEVTOOLS -----------------------------------------------------------------

    program
        .command('devtools-version <mdkVersion>')
        .option('-f, --forceUpdate', 'Force to update MDK Versions from server')
        .description('return devtool version for mdk version.')
        .action(function (mdkVersion, options) {
            if(typeof  options.forceUpdate === 'undefined') {
                options.forceUpdate = false;
            }
            devtools.specs.get(mdkVersion, options.forceUpdate, function (err, devtoolVersionObject) {
                if (err) {
                    exitWithMessage('Fail to find devtool version for mdk ' + mdkVersion + ': ' + err, 1);
                }
                else {
                    //Check result
                    assert.equal(typeof devtoolVersionObject, 'object');

                    console.log(clc.bold('Devtools version for MDK version ' + mdkVersion + ' : ') + devtoolVersionObject.version);
                    process.exit(0);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('devtools-install <platform> <mdkVersion>')
        .description('install development tools.')
        .action(function (platform, mdkVersion) {
            devtools.install.install(platform, mdkVersion, function (err) {
                if (err) {
                    exitWithMessage('Installation failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Installation success.', 0);
                }
            });
        }).on('--help', function () {
        });

// DEVTOOLS CHECKS -------------------------------------------------------

    program
        .command('devtools-check <platform> <mdkVersion>')
        .description('check mdk environment.')
        .action(function (platform, mdkVersion) {
            devtoolsCheck.check(platform, mdkVersion, false, function (err) {
                if (err) {
                    exitWithMessage('Check failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Check success.', 0);
                }
            });
        }).on('--help', function () {
        });

// PROJECT ---------------------------------------------------------------

    program
        .command('create <applicationId> <mdkVersion>')
        .description('create mdk project.')
        .action(function (applicationId, mdkVersion) {
            userProject.create(applicationId, mdkVersion, function (err) {
                if (err) {
                    exitWithMessage('Create project failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Project successfully created.', 0);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('platform-add <platform>')
        .description('add platform to the mdk project.')
        .option('-o, --offline', 'Add platform using offline for maven, cocoapods and gradle tools.')
        .action(function (platformName, options) {
            platform.runCmd("add", platformName, "Add platform " + clc.bold(platformName), options, function (err) {
                if (err) {
                    exitWithMessage('Add platform ' + clc.bold(platformName) + ' failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Platform ' + clc.bold(platformName) + ' successfully added.', 0);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('platform-build <platform>')
        .description('build platform.')
        .option('-o, --offline', 'Build platform using offline for maven, cocoapods and gradle tools.')
        .action(function (platformName, options) {

            platform.runCmd("build", platformName, "Build platform " + clc.bold(platformName), options, function (err) {
                if (err) {
                    exitWithMessage('Build platform ' + clc.bold(platformName) + ' failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Platform ' + clc.bold(platformName) + ' successfully built.', 0);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('platform-env <platform>')
        .description('display shell environment for mdk.')
        .action(function (platformName, options) {
            platform.runCmd("displayEnv", platformName, "Shell environment for platform " + clc.bold(platformName), options, function(err) {
                if ( err ) {
                    exitWithMessage('Shell environment for platform ' + clc.bold(platformName) + ' failed: ' + err, 1 );
                }
                else {
                    exitWithMessage('Shell environment ' + clc.bold(platformName), 0 );
                }
            });
        }).on('--help', function() {
        });

// CACHE -----------------------------------------------------------------
    program
        .command('cache-clear')
        .description('clear cache.')
        .action(function () {
            cache.clear(function (err) {
                if (err) {
                    exitWithMessage('Clear cache failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Cache removed.', 0);
                }
            });
        }).on('--help', function () {
        });

// USER ------------------------------------------------------------------
    program
        .command('auth')
        .description('define login/password for mdk authentication.')
        .action(function () {
            user.askCredentials(function (err) {
                if (err) {
                    exitWithMessage('Credentials not set: ' + err, 1);
                }
                else {
                    exitWithMessage('Credentials successfully updated.', 0);
                }
            });
        }).on('--help', function () {
        });
    program
        .command('*', '', {noHelp:true })
        .action(function (env) {
            console.log(clc.red.bold("'" + env + "' is not a valid command."));
            console.log();
            program.help();
        });

    program.parse(process.argv);

    if (!program.args.length) {
        program.help();
    }


}

function exitWithMessage(msg, code) {
    console.log();
    if ( code === 0 ) {
        console.log(clc.green('[Success]') + ' ' + msg);
    } else {
        console.log(clc.red('[Error]') + ' ' + msg );
    }
    console.log();
    process.exit(code);
}

exports.mdk = mdkThis;

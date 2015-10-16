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
var license = require('./license');

var LINE_BREAK = '\n';

function mdkThis() {

    program
        .version('1.0.0')
        .usage('cmd <parameters> [options]');

    program
        .command('create <applicationId> <mdkVersion>')
        .description('create mdk project.' + LINE_BREAK)
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

    // PROJECT ---------------------------------------------------------------

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
        .description('display shell environment for mdk.' + LINE_BREAK)
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
        .description('remove configuration value for parameter <key>' + LINE_BREAK)
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
        .command('version-info <version>')
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
        .option('-a, --acceptLicenses', 'Automatically accept third-party tools licenses')
        .option('-u, --updateAndroidSDK', 'If Android SDK is already installed, force to update')
        .description('install development tools.')
        .action(function (platform, mdkVersion, options) {
            if(typeof options.acceptLicenses === 'undefined') {
                options.acceptLicenses = false;
            }
            if(typeof options.updateAndroidSDK === 'undefined') {
                options.updateAndroidSDK = false;
            }
            devtools.install.install(platform, mdkVersion, options, function (err) {
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
        .description('check mdk environment.' + LINE_BREAK)
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



// CACHE -----------------------------------------------------------------
    program
        .command('cache-clear')
        .description('clear cache.'+ LINE_BREAK)
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
        .description('define login/password for mdk authentication.'+ LINE_BREAK)
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
        .command('license')
        .description('show Movalys MDK License'+ LINE_BREAK)
        .action(function () {
            license.printLicense();
        }).on('--help', function () {
        });

// HIDDEN -------------------------------------------------------------------
    program
        .command('devtools-uninstall <platform> <mdkVersion>',  '', {noHelp:true })
        .description('uninstall development tools.')
        .option('-d, --dependencies', "Remove dependencies")
        .action(function (platform, mdkVersion, options) {
            if(typeof options.dependencies === 'undefined') {
                options.dependencies = false;
            }
            devtools.install.uninstall(platform, mdkVersion, options.dependencies, function (err) {
                if (err) {
                    exitWithMessage('Uninstallation failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Uninstallation success.', 0);
                }
            });
        }).on('--help', function () {
        });

// GENERIC ------------------------------------------------------------------
    program
        .command('*', '', {noHelp:true })
        .action(function (env) {
            console.log(clc.red.bold("'" + env + "' is not a valid command."));
            console.log();
            program.help();
        });

    program.parse(process.argv);

    if (!program.args.length) {
        console.log("\n"+
            clc.cyanBright("  8888ba.88ba  888888ba  dP     dP \n") +
            clc.cyanBright("  88  `8b  `8b 88    `8b 88   .d8' \n") +
            clc.cyanBright("  88   88   88 88     88 88aaa8P'  \n") +
            clc.cyanBright("  88   88   88 88     88 88   `8b. \n") +
            clc.cyanBright("  88   88   88 88    .8P 88     88 \n") +
            clc.cyanBright("  dP   dP   dP 8888888P  dP     dP \n") +
            clc.greenBright.bold("  oooooooooooooooooooooooooooooooo\n"));
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

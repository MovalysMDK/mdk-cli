'use strict';



var program = require('commander');
// Override default message when there are missing arguments
program.Command.prototype.missingArgument = function(name) {
    console.error();
    console.error("  error: Required argument(s) is/are missing");
    console.error();
    process.exit(1);
};
//

var assert = require('assert');
var clc = require('cli-color');

var config = require('./config');
var versions = require('./mdk/versions');
var templates = require('./mdk/templates');
var cache = require('./cache');
var devtools = require('./devtools');
var devtoolsCheck = require('./devtools/check');
var userProject = require('./project');
var projectUpgrade = require('./project/upgrade');
var platform = require('./platform');
var user = require('./user');
var license = require('./license');
var async = require('async');
var mdkLog = require('./utils/log');

var LINE_BREAK = '\n';

function mdkThis() {

    program
        .version('0.9.4')
        .usage('cmd <parameters> [options]');

    program.command('').description(
        LINE_BREAK+
        clc.green.bold("------------- General commands -------------")
    );

    program
        .command('create <applicationId>')
        .option('-o, --offline', 'offline mode.')
        .option('-t, --templateName <name>', 'the template name to use')
        .option('-v, --templateVersion <version>', 'the template version to use')
        .option('-p, --platforms <platforms>', 'the platform(s) to add to the project once created. Example: -p ios,android', function (val) {return val.split(',');})
        .description('Create a new MDK project.' + LINE_BREAK)
        .action(function (applicationId, options) {
            userProject.create(applicationId, options, function (err) {
                if (err) {
                    exitWithMessage('Create project failed: ' + err, 1);
                }
                else {
                    if (typeof options.platforms !== 'undefined') {
                        console.log(clc.green.bold('[Success]') + 'Project successfully created.');
                        console.log();

                        // Loop on platform one by one
                        async.eachSeries(options.platforms, function (platformName, cb) {
                            console.log('-----------------------');
                            var platformoptions = {offline: options.offline};
                            platformAddAction(platformName, platformoptions, function (err) {

                                if (err) {
                                    console.log(clc.red.bold('[Error]') + 'Couldn\'t add platform '+platformName+' : ' + err);
                                } else {
                                    console.log();
                                    console.log(clc.green.bold('[Success]') + platformName + ' platform added.');
                                }
                                cb(err);
                            });
                        }, function(err) {
                           if (err) {
                               exitWithMessage('A problem occurred adding platform(s)', 1);
                           } else {
                               exitWithMessage('Platform(s) added.', 0);
                           }
                        });

                    } else {
                        exitWithMessage('Project successfully created.', 0);
                    }

                }
            });
        }).on('--help', function () {
            console.log("  Arguments:\n");
            console.log(clc.bold("     applicationId"));
            console.log("        The package name of the application (lowercase Alphabet only).\n"+
                "        It should contain at least one dot and the last part (used as applicationId) can contain digits\n" +
                clc.italic("        Example : com.mycompany.myproject123\n"));

            mdkCreateHelpNotice();
        });

    program
        .command('templates')
        .description('List available templates' + LINE_BREAK)
        .option('-f, --forceUpdate', 'Force the templates file to update')
        .option('-a, --all', 'Detailed list of available templates')
        .action(function (options) {
            options.forceUpdate = options.forceUpdate || false;
            options.all = options.all || false;

            templates.list(options.forceUpdate, function (err, result) {
                if (err) {
                    exitWithMessage('Failure reading templates: ' + err, 1);
                }
                else {
                    //Check Result
                    assert.equal(typeof result, 'object');
                    templates.display(result, options.all, function (err) {
                        if(err) {
                            exitWithMessage('Failure reading templates: ' + err, 1);
                        }
                        else {
                            mdkTemplatesSuccessNotice();
                            process.exit(0);
                        }
                    });
                }
            });
        }).on('--help', function () {
        });

    // DEVTOOLS -----------------------------------------------------------------
    program
        .command('tools-install <platform>')
        .option('-a, --acceptLicenses', 'Automatically accept third-party tools licenses', false)
        .option('-u, --updateAndroidSDK', 'If Android SDK is already installed, force to update', false)
        .option('-v, --mdkVersion <version>', 'Install tools for a specific MDK version','last')
        .description('Install MDK environment for a given platform')
        .action(function (platform, options) {
            async.waterfall([
                    function(cb) {
                        if (options.mdkVersion === 'last') {
                            versions.lastVersion(cb);
                        } else {
                            cb(null, options.mdkVersion);
                        }
                    },
                    function(mdkVersion, cb) {
                        devtools.install.install(platform, mdkVersion, options, cb);
                    }
                ], function (err) {
                    if (err) {
                        exitWithMessage('Installation failed: ' + err, 1);
                    }
                    else {
                        exitWithMessage('Installation success.', 0);
                    }
                }
            );
        }).on('--help', function () {
            console.log("  Arguments:\n");

            console.log(clc.bold("     platform"));
            console.log("        The platform name of the MDK environment to install. Must be one of these values : android, ios." +
                clc.italic("        Example : ios"));
        });

// DEVTOOLS CHECKS -------------------------------------------------------

    program
        .command('tools-check <platform>')
        .option('-v, --mdkVersion <version>', 'Check for a specific MDK version')
        .description('Check the validity of the environment for given a platform' + LINE_BREAK)
        .action(function (platform, options) {
            async.waterfall([
                    function(cb) {
                        if (typeof options.mdkVersion === 'undefined') {
                            versions.lastVersion(cb);
                        } else {
                            cb(null, options.mdkVersion);
                        }
                    },
                    function(mdkVersion, cb) {
                        options.mdkVersion = mdkVersion;
                        devtoolsCheck.check(platform, mdkVersion, false, cb);
                    }
                ], function (err) {
                    if (err) {
                        exitWithMessage('Check failed: ' + err, 1, function() {mdkToolsCheckFailedNotice(platform, options.mdkVersion);});
                    }
                    else {
                        exitWithMessage('Check success.', 0);
                    }
                }
            );
        }).on('--help', function () {
            console.log("  Arguments:\n");

            console.log(clc.bold("     platform"));
            console.log("        The platform name of the MDK environment to check. Must be one of these values : android, ios." +
                clc.italic("        Example : ios"));
        });


    // CONFIG -----------------------------------------------------------------
    program
        .command('config-get <key>')
        .description('Get configuration value associated to the given key')
        .action(function (key) {
            config.displayValue(key, function (err) {
                if (err) {
                    exitWithMessage(err, 1);
                }
            });

        }).on('--help', function () {
            console.log("  Arguments:\n");

            console.log(clc.bold("     key"));
            console.log("        The key to use to retrieve the associated value" +
                clc.italic("        Example : username"));
        });

    program
        .command('config-set <key> <value>')
        .description('Set a configuration value associated to the given key')
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
            console.log("  Arguments:\n");

            console.log(clc.bold("     key"));
            console.log("        The key to use to set an associated value" +
                clc.italic("        Example : username"));

            console.log(clc.bold("     value"));
            console.log("        The value to set" +
                clc.italic("        Example : toto"));
        });

    program
        .command('config-list')
        .description('Show all configuration values')
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
        .description('Delete configuration value associated to the given key' + LINE_BREAK)
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
            console.log("  Arguments:\n");

            console.log(clc.bold("     key"));
            console.log("        The key to use to delete the associated value" +
                clc.italic("        Example : username"));
        });

    // VERSIONS -----------------------------------------------------------------
    program
        .command('version-list',   '', {noHelp:true })
        .description('Show all version of MDK')
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
        .command('version-last',   '', {noHelp:true })
        .description('Show only last version of MDK')
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
        .description('Show information about the given MDK version ')
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
            console.log("  Arguments:\n");

            console.log(clc.bold("     version"));
            console.log("        The MDK version whose information will be displayed" +
                clc.italic("        Example : 6.0.1"));
        });

    program.command('').description(
        LINE_BREAK+
        clc.green.bold("------------- Project commands -------------  Need to be ran in a MDK Project directory")
    );

    program
        .command('infos')
        .description('Get information about the project.' + LINE_BREAK)
        .action(function (options) {
            userProject.infos(function (err, result) {
                if (err) {
                    exitWithMessage('Unable to get MDK Project information: ' + err, 1);
                }
                else {
                    console.log("");
                    console.log(clc.bold("PROJECT NAME\t") + " : " + result.project.artifactId);
                    console.log(clc.bold("PROJECT VERSION\t") + " : " + result.project.version);
                    console.log(clc.bold("TEMPLATE NAME\t") + " : " + result.template.name);
                    console.log(clc.bold("TEMPLATE VERSION") + " : " + result.template.version);
                    console.log(clc.bold("MDK VERSION\t") + " : " + result.project.mdkVersion);
                    console.log("");
                }
            });
        }).on('--help', function () {
        });


    // PROJECT ---------------------------------------------------------------

    var platformAddAction = function (platformName, options, callback) {
        callback = callback || function (err) {
                if (err) {
                    exitWithMessage('Add platform ' + clc.bold(platformName) + ' failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Platform ' + clc.bold(platformName) + ' successfully added.', 0);
                }
            };

        platform.runCmd("add", platformName, "Adding " + clc.bold(platformName) + " platform " , options, callback);
    };

    program
        .command('platform-add <platform>')
        .description('Add a platform to the current MDK project.')
        .option('-o, --offline', 'Add platform using offline for maven, cocoapods and gradle tools.')
        .action(platformAddAction)
        .on('--help', function () {
            console.log("  Arguments:\n");

            console.log(clc.bold("     platform"));
            console.log("        The platform name to add. This value must be one of these : android, ios.\n" +
                clc.italic("        Example : ios"));

        });

    program
        .command('platform-build <platform>')
        .description('Build the given platform of the current MDK project')
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
            console.log("  Arguments:\n");

            console.log(clc.bold("     platform"));
            console.log("        The platform name to build. This value must be one of these : android, ios.\n" +
                clc.italic("        Example : ios"));

        });

    program
        .command('platform-gensrc <platform>')
        .description('Generate source code of the MDK project for the given platform')
        .option('-o, --offline', 'Generate using offline for maven.')
        .action(function (platformName, options) {

            platform.runCmd("generate", platformName, "Generate platform " + clc.bold(platformName), options, function (err) {
                if (err) {
                    exitWithMessage('Generate platform ' + clc.bold(platformName) + ' failed: ' + err, 1);
                }
                else {
                    exitWithMessage('Platform ' + clc.bold(platformName) + ' successfully generated.', 0);
                }
            });
        }).on('--help', function () {
            console.log("  Arguments:\n");

            console.log(clc.bold("     platform"));
            console.log("        The platform name to generate. This value must be one of these : android, ios.\n" +
                clc.italic("        Example : ios"));

        });

    program
        .command('upgrade <target>')
        .description('Upgrade local project template to the given target version' + LINE_BREAK)
        .action(function (target) {

            projectUpgrade.upgrade(target, function(err){
                if (err){
                    exitWithMessage(err, 1);
                }else{
                    exitWithMessage("Project upgraded to version " + target, 0);
                }
            });


        }).on('--help', function() {
            console.log("  Arguments:\n");

            console.log(clc.bold("     target"));
            console.log("        The new template version to base your project on.\n" +
                clc.italic("        Example : 6.1.0"));
        });

    program
        .command('platform-env <platform>')
        .description('Display shell environment of the given platform for the current MDK project' + LINE_BREAK)
        .action(function (platformName, options) {
            platform.runCmd("displayEnv", platformName, "Shell environment for platform " + clc.bold(platformName), options, function(err) {
                if ( err ) {
                    exitWithMessage('Shell environment for platform ' + clc.bold(platformName) + ' failed: ' + err, 1);
                }
                else {

                    exitWithMessage('Shell environment ' + clc.bold(platformName), 0 );
                }
            });
        }).on('--help', function() {
            console.log("  Arguments:\n");

            console.log(clc.bold("     platform"));
            console.log("        The platform name to get environement variables. This value must be one of these : android, ios.\n" +
                clc.italic("        Example : ios"));
        });

    // PLATFORM-CONFIG ----------------------------------------------------------
    program
        .command('platform-config-list <platform>')
        .description('Show all configuration values for the given platform')
        .action(function (platformName) {
            platform.displayConfigValues(platformName, function (err) {
                if (err) {
                    exitWithMessage('Error retrieving the configuration values : ' + err, 1);
                }

            });
        }).on('--help', function () {
        });

    program
        .command('platform-config-get <platform> <key>')
        .description('Show all configuration values for the given platform')
        .action(function (platformName, key) {
            platform.getConfigList(platformName, function (err, configValues) {
                if (err) {
                    exitWithMessage('Error retrieving the configuration values : ' + err, 1);
                }

                if (configValues && configValues[key]) {
                    require('./config/logParam')(key, configValues[key], false);
                } else {
                    require('./utils/log').ko("platform configuration","Couldn't find the value for key " + key);
                }
            });
        }).on('--help', function () {
        });

    program
        .command('platform-config-set <platform> <key> <value>')
        .description('Show all configuration values for the given platform')
        .action(function (platformName, key, value) {
        // First check the key exists
            platform.getConfigList(platformName, function (err, configValues) {
                if (err) {
                    exitWithMessage('Error retrieving the configuration values : ' + err, 1);
                }

                if (configValues && configValues[key]) {
                    platform.setConfigValue(platformName, key, value, function(err) {
                        if (err) {
                            exitWithMessage('Error setting parameter "' + key + '" with value : "' + value + '"' + err, 1);
                        }
                        else {
                            exitWithMessage('Parameter "' + key + '" updated with value : "' + value + '".', 0);
                        }
                    });
                } else {
                    require('./utils/log').ko("platform configuration","Couldn't find the value for key " + key);
                }
            });
        }).on('--help', function () {
        });


    program.command('').description(
        LINE_BREAK+
        clc.green.bold("--------------- Miscellaneous --------------")
    );

    // USER ------------------------------------------------------------------
    program
        .command('auth')
        .description('Define login/password for MDK authentication')
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
// CACHE -----------------------------------------------------------------
    program
        .command('cache-clear')
        .description('Clear mdk-cli cache')
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

    program
        .command('license')
        .description('Show Movalys MDK License')
        .action(function (opts) {
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

    program
        .command('tools-version <mdkVersion>',   '', {noHelp:true })
        .option('-f, --forceUpdate', 'Force to update MDK Versions from server')
        .description('Show the devtools version associated to the given MDK version')
        .action(function (mdkVersion, options) {
            if(typeof options.forceUpdate === 'undefined') {
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
            console.log("  Arguments:\n");

            console.log(clc.bold("     version"));
            console.log("        The MDK version whose devtools version will be displayed" +
                clc.italic("        Example : 6.0.1"));
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

    if (program.rawArgs.length <= 2) { // no args
        console.log("\n"+
            clc.red("  8888ba.88ba  888888ba  dP     dP \n") +
            clc.red("  88  `8b  `8b 88    `8b 88   .d8' \n") +
            clc.red("  88   88   88 88     88 88aaa8P'  \n") +
            clc.red("  88   88   88 88     88 88   `8b. \n") +
            clc.red("  88   88   88 88    .8P 88     88 \n") +
            clc.red("  dP   dP   dP 8888888P  dP     dP  " + "- CLI (version :"+ program.version() + ")\n"));
        mdkQuickNotice();
        program.help();
    }
}



/**
 * Exit the program with a custom message. A notice can also be added
 * to inform the user of what to do next.
 * @param msg The message to display
 * @param code The exit code
 * @param noticeCallback An optional notice to inform the used of
 * what to do now
 */
function exitWithMessage(msg, code, noticeCallback) {
    console.log();
    if ( code === 0 && msg) {
        console.log(clc.green.bold('[Success]') + ' ' + msg);
    } else {
        console.log(clc.red.bold('[Error]') + ' ' + msg );
    }
    if(typeof noticeCallback != 'undefined') {
        noticeCallback();
    }

    console.log();

    process.exit(code);
}

exports.mdk = mdkThis;


/*******************************************
 *  NOTICES :
 *  Notices to be displayed to help the user
 *******************************************/
var mdkTemplatesSuccessNotice = function () {
    console.log();
    mdkLog.separator();
    mdkLog.notice("Create a MDK project", "Use a template listed above to create a new MDK project");
    mdkLog.notice("Create a project with the command : " + clc.bold("mdk create <applicationId> [-t <templateName>][-v <templateVersion>]"));
    mdkLog.notice("where  : ");
    mdkLog.notice("  * " + clc.bold("applicationId") +  " is the unique application identifier of your project (mandatory)");
    mdkLog.notice("  * " + clc.bold("templateName") +  " is the template name to use. If not specified, the default template will be used (optional)");
    mdkLog.notice("  * " + clc.bold("templateVersion") +  " is the template version to use. If not specified, the last version will be used (optional)");
    mdkLog.separator();
    console.log();
};


var mdkToolsCheckFailedNotice = function(platform, mdkVersion) {
    console.log();
    mdkLog.separator();
    mdkLog.notice("Check failed", "Try to fix the issues with command '"+ clc.bold("mdk tools-install -v " + mdkVersion + " " + platform) +  "'");
    mdkLog.separator();
    console.log();
};

function mdkCreateHelpNotice () {
    console.log();
    mdkLog.separator();
    mdkLog.notice("You should use " + clc.bold("mdk templates [-a]") + " to choose a ");
    mdkLog.notice("specific template and/or a version to use");
    mdkLog.separator();
    console.log();
}

function mdkQuickNotice () {
    console.log();
    console.log(clc.bold.cyan("Quick notice :"));
    console.log("  1. Install a MDK environment with " + clc.bold("mdk tools-install android") + " or/and " + clc.bold("mdk tools-install ios"));
    console.log("  2. Check your environment is properly installed with " + clc.bold("mdk tools-check android") + " or/and " + clc.bold("mdk tools-check ios"));
    console.log("  3. Create a new MDK project with " + clc.bold("mdk create <applicationId> -p <platforms>") + " (where platforms could be 'android', 'ios' or both)");
    console.log("     "+clc.italic("Example : mdk create com.soprasteria.myapp -p android,ios"));
    console.log("  4. Build your platform with " + clc.bold("mdk platform-build android")+ " or/and " + clc.bold("mdk platform-build ios"));
    console.log("  5. Open your project and develop ;) ");
    console.log();
    mdkLog.separator();
}
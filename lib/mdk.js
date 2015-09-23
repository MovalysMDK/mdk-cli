'use strict'

var program = require('commander');

var config = require('./config');
var versions = require('./versions');
//var createProject = require('./create');
//var android = require('./android');
//var ios = require('./ios');
//var checkenv = require('./checkenv');
//var scm = require('./scm');
var clc = require('cli-color');

function mdkThis() {

    program
        .version('1.0.0');

    // CONFIG -----------------------------------------------------------------
    program
        .command('config-get <key>')
        .description('get configuration value parameter key.')
        .action(function( key ){

            config.get(key, function(err, value) {
                if ( err ) {
                    exitWithMessage(err, 1 );
                }
                else {
                    console.log(value);
                }
            });

        }).on('--help', function() {
            //TODO:
        });

    program
        .command('config-set <key> <value>')
        .description('set configuration value for parameter key.')
        .action(function( key, value ){
            config.set(key, value, function(err) {
                if ( err ) {
                    exitWithMessage('Error setting parameter "' + key + '" with value : "' + value + '"' + err, 1 );
                }
                else {
                    exitWithMessage('Parameter "' + key + '" updated with value : "' + value + '".', 0 );
                }
            });
        }).on('--help', function() {
        });

    program
        .command('config-list')
        .description('show configuration values')
        .action(function(){
            config.list(function(value, err) {
                if ( err ) {
                    exitWithMessage('Error retrieving list of parameters', 1 );
                }
                else {
                    for(var pair in value)
                        console.log("'" + pair + "' = '" + value[pair] + "'");
                }
            });
        }).on('--help', function() {
        });

    program
        .command('config-del <key>')
        .description('remove configuration value for parameter <key>')
        .action(function( key ){
            config.del(key, function(err, value) {
                if ( err ) {
                    exitWithMessage(err, 1 );
                }
                else {
                    exitWithMessage('Parameter "' + key + '" deleted from user configuration file.', 0 );
                }
            });
        }).on('--help', function() {
        });




    // VERSIONS -----------------------------------------------------------------

    program
        .command('version-list')
        .description('show all versions of MDK')
        .action(function( err, list ){
            versions.list( function(err, list) {
                if ( err ) {
                    exitWithMessage('Failure reading version list: ' + err, 1 );
                }
                else {
                    console.log(clc.bold('MDK Versions :'));
                    list.versions.forEach(function (item) { console.log(item.version)});
                    exitWithMessage('End of list.', 0 );
                }
            });

        }).on('--help', function() {
            //TODO
        });

    program
        .command('version-last')
        .description('show last version of MDK')
        .action(function(err, last){
            versions.lastVersion( function(err, last) {
                if (err) {
                    exitWithMessage('Failure reading last version: ' + err, 1);
                }
                else {
                    console.log(clc.bold('MDK Last Version : ')+ last);
                    exitWithMessage('', 0);
                }
            });
        }).on('--help', function() {
            //TODO
        });

    program
        .command('version-update')
        .description('update version list')
        .action(function(){
            console.log("get");
        }).on('--help', function() {
        });

    /*program
        .command('build <command>')
        .description('mdk-cli configuration')
        .action(function( command ){
            console.log('  Examples:');
            console.log('');
            console.log('    $ custom-help --help');
            console.log('    $ custom-help -h');
            console.log('');
        });
*/
    /*program
        .command('config set <key>')
        .description('mdk-cli configuration')
        .action(function( key ){
            console.log("get");
        });

    program
        .command('config set <key> <value>')
        .description('mdk-cli configuration');

        /*.action(function( subcommand, param1, param2 ){

            if ( subcommand === 'get') {

                //TODO: check param1 is valued

                var key = param1;

                config.get(key, function(err, value) {
                    if ( err) {
                        exitWithMessage('Unknown property: ' + err, 1 );
                    }
                    else {
                        exitWithMessage(value, 0 );
                    }
                });
            }
            else if ( subcommand === 'set') {

                //TODO: check param1,param2 are valued

                var key = param1;
                var value = param2;

                config.set(key, value, function(err) {
                    if ( err) {
                        exitWithMessage('TODO' + err, 1 );
                    }
                    else {
                        exitWithMessage('TODO', 0 );
                    }
                });
            }
            else if ( subcommand === 'delete') {

                //TODO: check param1 is valued

                var key = param1;

                config.delete(key, function(err) {
                    if ( err) {
                        exitWithMessage('TODO' + err, 1 );
                    }
                    else {
                        exitWithMessage('TODO', 0 );
                    }
                });
            }
            else if ( subcommand === 'list') {

                config.list(function(err, values) {
                    if ( err) {
                        exitWithMessage('build ios project failed: ' + err, 1 );
                    }
                    else {
                        //TODO: show all values
                        exitWithMessage('', 0 );
                    }
                });
            }
            else {
                //TODO: show help for config command
                exitWithMessage('', 1);
            }
        });*/

    /*program
        .command('create <artifactId> <groupId> <mdkVersion>')
        .description('create a new mdk project')
        .action(function(artifactId, groupId, version, mdkVersion) {

            var conf = {};
            conf.project = {};
            conf.project.artifactId = artifactId;
            conf.project.groupId = groupId;
            conf.project.version = "1.0.0";
            conf.project.mdkVersion = mdkVersion;

            createProject.create(conf, function( err, data) {
                if ( err) {
                    exitWithMessage('Create failed: ' + err, 1 );
                }
                else {
                    exitWithMessage('Project created successfully.', 0 );

                }
            });
        });
    program
        .command('add <platform>')
        .description('add a specified platform (android,ios)')
        .action(function(platform){

            if ( platform === 'android') {
                android.add( function(err) {
                    if ( err) {
                        exitWithMessage('add android project failed: ' + err, 1 );
                    }
                    else {
                        exitWithMessage('Project android added successfully.', 0 );
                    }
                });
            }
            else if ( platform === 'ios') {
                ios.add( function(err) {
                    if ( err) {
                        exitWithMessage('add ios project failed: ' + err, 1 );
                    }
                    else {
                        exitWithMessage('Project ios added successfully.', 0 );
                    }
                });
            }
            else {
                exitWithMessage('platform not found: ' + platform, 1);
            }
        });
    program
        .command('build <platform>')
        .description('build a specified platform')
        .action(function( platform ){

            if ( platform === 'android') {
                android.build( function(err) {
                    if ( err) {
                        exitWithMessage('build android project failed: ' + err, 1 );
                    }
                    else {
                        exitWithMessage('Project android built successfully.', 0 );
                    }
                });
            }
            else if ( platform === 'ios') {
                ios.build( function(err) {
                    if ( err) {
                        exitWithMessage('build ios project failed: ' + err, 1 );
                    }
                    else {
                        exitWithMessage('Project ios built successfully.', 0 );
                    }
                });
            }
            else {
                exitWithMessage('platform not found: ' + platform, 1);
            }
        });*/
    /*program
        .command('checkenv <platform>')
        .description('check environment for platform')
        .action(function( platform ){

            if ( platform === 'android') {
                checkenv.checkAndroidEnv( function(err) {
                    if ( err) {
                        exitWithMessage('Check failures before', 1 );
                    }
                    else {
                        exitWithMessage('Environment is ok.', 0 );
                    }
                });
            }
            else if ( platform === 'ios') {
                checkenv.checkIosEnv( function(err) {
                    if ( err) {
                        exitWithMessage('Check failures before', 1 );
                    }
                    else {
                        exitWithMessage('Environment is ok.', 0 );
                    }
                });
            }
            else {
                exitWithMessage('platform not found: ' + platform, 1);
            }
        });*/
    /*program
        .command('importsvn')
        .description('import project into svn')
        .option('-s, --svnpath <s>', 'svn path')
        .action(function() {
            scm.svn.importProject(program.args[0].svnpath, function(err) {
                if ( err) {
                    exitWithMessage('Import svn failed: ' + err, 1 );
                }
                else {
                    exitWithMessage('Project successfully commited to svn.', 0 );
                }
            });
        });*/

    /*program.on('--help', function(){

        console.log('');
        console.log('  Usage: mdk <command>');
        console.log('');
        console.log('');
        console.log('  Commands:');
        console.log('');
        console.log('      config get <key>  get value for parameter <key>');
        console.log('      config set <key> <value>  get value for parameter <key>');
        console.log('      config delete <key>  delete parameter <key>');
        console.log('      config list  show all parameters');
        console.log('');
        console.log('  Options:');
        console.log('');
        console.log('  -h, --help     output usage information');
        console.log('  -V, --version  output the version number');
        console.log('');
    });*/

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
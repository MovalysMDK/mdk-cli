'use strict';

var assert = require('assert');

var spawn = require('../../../utils/system');

/**
 * Run test on project
 * @param projectConf project configuration
 * @param callback callback
 */
function test(projectConf, callback) {

    //TODO: compute path to xctool
    var xctoolBuildCmd = 'xctool';
    var xctoolBuildArgs = [
        '-workspace',
            projectConf.project.artifactId + '.xcworkspace',
        '-scheme',
            projectConf.project.artifactId,
        '-sdk',
        'iphonesimulator',
        '-derivedDataPath',
        './build',
        '-reporter',
        'junit:./junit-report.xml',
        'test'
    ];

    spawn(xctoolBuildCmd, xctoolBuildArgs, function(err) {
        if ( err ) {
            callback(err);
        }
        else {
            callback();
            //TODO: spawn("sh", ['computeCoverage.sh'], callback );
        }
    });
}
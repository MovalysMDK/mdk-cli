'use strict';

var assert = require('assert');

var spawn = require('../../../utils/system');
var getXctoolCmd = require('./getXctoolCmd');

/**
 * Run test on project
 * @param projectConf project configuration
 * @param callback callback
 */
function build(projectConf, toolSpecs, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    getXctoolCmd( toolSpecs, function(err, xctoolCmd) {
        if (err) {
            callback(err);
        }
        else {
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

            spawn(xctoolCmd, xctoolBuildArgs, function(err) {
                if ( err ) {
                    callback(err);
                }
                else {
                    callback();
                    //TODO: spawn("sh", ['computeCoverage.sh'], callback );
                }
            });
        }
    });
}
"use strict"

var fs = require('fs-extra');
var readUserConf = require('./readUserConf');
var mergeConf = require('./mergeConf');

/**
 * Read project configuration at project level.
 * <p>Following configuration files are merged :</p>
 * <ul>
 *     <li>mdk-project.json from npm-cli installation.</li>
 *     <li>mdk-project.json from ~/.mdk/mdk-project.json</li>
 *     <li>mdk-project.json from project directory.</li>
 * </ul>
 * @param callback
 *
 */
function read(callback) {

    assert.equal(typeof callback, 'function');

    // Read configuration at user level.
    readUserConf( function(err, userConf) {

        if ( err ) {
            callback(err);
        }
        else {
            var projectConfigFile = 'mdk-project.json';

            fs.access(projectConfigFile, fs.R_OK, function(err) {

                if ( err ) {
                    callback('Current directory is not a mdk project: mdk-project.json not found');
                }
                else {
                    fs.readJson(projectConfigFile, function (err, projectConf) {
                        callback(null, mergeConf(userConf, projectConf));
                    });
                }
            });
        }
    });
}

module.exports = read;
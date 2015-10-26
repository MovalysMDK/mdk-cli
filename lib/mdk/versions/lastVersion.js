"use strict";

var assert = require('assert');
var async = require('async');

var config = require('../../config/index');
var load = require('./load');

/**
 * Return the last version of mdk
 * @param callback
 */
function lastVersion(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');


    async.waterfall( [
        function (cb) {
            // read configuration to known where mfxcode is installed.
            config.get("snapshotEnable", cb);
        },
        function(snapshotEnable, cb) {

            load(false, function(err, versions) {
                if (err) {
                    callback(err);
                }
                else {
                    versions.versions.forEach(function (item) {
                            if (item.version.indexOf("-SNAPSHOT") === -1 || snapshotEnable === 'true') {
                                cb(null, item.version);
                            }
                        }
                    );
                    cb("No version found");

                }
            });
        },

    ], function(err, result) {
        if ( err ) {
            callback(err);
        }
        else {
            // all checks passed, don't need to reinstall
            callback(null, result);
        }
    });

}


module.exports = lastVersion;
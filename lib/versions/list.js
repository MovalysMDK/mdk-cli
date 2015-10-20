"use strict";


var assert = require('assert');
var async = require('async');

var config = require('../config');
var load = require('./load');

/**
 * Return all versions of mdk.
 * @param callback
 */
function list(callback) {

    //Check parameters
    assert.equal(typeof callback, 'function');


    async.waterfall( [
        function (cb) {
            // read configuration to known where mfxcode is installed.
            config.get("snapshotEnable", cb);
        },
        function(snapshotEnable, cb) {
            load(false, function(err, versions) {
                var versionsWithoutSnapshots = {versions:[]};
                versions.versions.forEach(function (item) {
                    if (item.version.indexOf("-SNAPSHOT") === -1 || snapshotEnable === 'true') {
                        versionsWithoutSnapshots.versions.push(item);
                    }
                });
                cb(err, versionsWithoutSnapshots);
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


//Load versions

}

module.exports = list;
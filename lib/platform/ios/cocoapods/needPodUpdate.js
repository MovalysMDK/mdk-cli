'use strict';

var fs = require('fs-extra');
var assert = require('assert');
var async = require('async');
var path = require('path');

var system = require('../../../utils/system');

/**
 * Compute if a pod update needs to be performed.
 * @param callback
 */
function needPodUpdate(callback) {

    assert.equal(typeof callback, 'function');

    var podFile = path.join("ios", "Podfile");
    var podFileLock = path.join("ios", "Podfile.lock");

    fs.access(podFileLock, fs.F_OK, function(err) {
        if ( err ) {
            // if Podfile.lock is missing, a pod update is required.
            callback(null, true);
        }
        else {
            fs.stat(podFile, function(err, stats) {
                if ( err ) {
                    callback(err);
                }
                else {
                    fs.stat(podFileLock, function (err, lockStats) {
                        if ( err ) {
                            callback(err);
                        }
                        else {
                            // If podfile modification date is superior, a pod update needs to be run.
                            callback(null, stats.mtime.getTime() > lockStats.mtime.getTime());
                        }
                    });
                }
            });
        }
    });
}

module.exports = needPodUpdate ;
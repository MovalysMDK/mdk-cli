'use strict';

var fs = require('fs-extra');
var async = require('async');
var path = require('path');
var assert = require('assert');

var system = require('../../../utils/system');
var config = require('../../../config');

/**
 * Restore the backup of file .netrc
 * @param osName osName
 * @param callback callback
 */
function restore(osName, callback) {

    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    var netrcFile ;
    var backupFile ;
    if ( osName === "win" ) {
        netrcFile = path.join(system.userHome(), "_netrc");
        backupFile = netrcFile + "_mdkbackup";
    }
    else {
        netrcFile = path.join(system.userHome(), ".netrc");
        backupFile = netrcFile + ".mdkbackup";
    }

    fs.access(backupFile, fs.F_OK, function(err) {
        if (err) {
            fs.remove(netrcFile, function(err) {
                callback(err);
            });
        }
        else {
            // backup current .netrc
            fs.move(backupFile, netrcFile, { "clobber": true }, function (err) {
                callback(err);
            });
        }
    });
}

module.exports = restore;
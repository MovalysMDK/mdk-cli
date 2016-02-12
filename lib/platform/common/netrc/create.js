/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var fs = require('fs-extra');
var async = require('async');
var path = require('path');
var assert = require('assert');
var url = require('url');

var system = require('../../../utils/system');
var config = require('../../../config');

/**
 * Create .netrc file in userHome directory with the following credentials.
 * @param osName osName
 * @param callback callback
 */
function create(osName, callback) {

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

    async.waterfall([
        function (cb) {
            // remove previous backup
            fs.remove(backupFile, function(err) {
                //ignore errors
                cb();
            });
        },
        function (cb) {
            fs.access(netrcFile, fs.F_OK, function(err) {
                if (err) {
                    cb();
                }
                else {
                    // backup current .netrc
                    fs.move(netrcFile, backupFile, function (err) {
                        cb(err);
                    });
                }
            });
        },
        function (cb) {
            // load credentials
            config.getList(["mdk_login", "mdk_password", "mdkRepoGit"], function(err, values) {
                cb(err, values);
            });
        },
        function (values, cb) {
            var urlInfo = url.parse(values.mdkRepoGit);
            var content = "machine " + urlInfo.hostname + "\n";
            content += "login " + values.mdk_login + "\n";
            content += "password " + values.mdk_password + "\n";
            fs.writeFile(netrcFile, content, {}, function(err) {
                cb(err);
            });
        }
    ],
    function(err) {
        if ( err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = create;
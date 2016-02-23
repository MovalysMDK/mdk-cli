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
var assert = require('assert');
var async = require('async');
var path = require('path');

var system = require('../../../utils/system');
var getPodCmd = require('./getPodCmd');
var netrc = require('../../common/netrc');
var config = require('../../../config');

/**
 * Run pod update inside project
 * @param projectConf project configuration
 * @param toolSpecs tools specification
 * @param callback callback
 */
function podUpdate(projectConf, toolSpecs, callback) {

    assert.equal(typeof projectConf, 'object');
    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof callback, 'function');

    process.chdir('ios');

    var runPodUpdate = false;
	var snapshot = false;

    async.waterfall([
		function(cb){
			config.getList(["snapshotEnable"], cb);
		}, 
		
		function(values, cb){
			if ( values.snapshotEnable === "true" && /SNAPSHOT$/.test(projectConf.project.mdkVersion) ){
				snapshot = true;
			}
		},

        function(cb) {
			if (snapshot){
            	netrc.create("osx", cb);
			}else{
				return cb();
			}
        },
		
        function(cb) {
            getPodCmd(toolSpecs, cb);
        },
		
        function(podCmd, cb) {
            var args = ['update'].concat(projectConf.options.cocoapodOptions);
            system.spawn( podCmd, args, function( err, stdout, stder ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb();
                }
            });
        }
    ],
    function(err) {
        if (err && err !== "ignorePodUpdate") {
            callback(err);
        }
        else {
            if (snapshot){
				netrc.restore("osx", function(err2) {
					process.chdir('..');
					callback(err);
				});
			}else{
				return callback();
			}
        }
    });
}

module.exports = podUpdate ;
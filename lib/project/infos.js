'use strict';

var path = require('path');
var assert = require('assert');
var semver = require('semver');
var fs = require('fs-extra');
var async = require('async');
var clc = require('cli-color');

var system = require('../utils/system');
var network = require('../utils/network');
var user = require('../user');
var projectConfig = require('./config');
var config = require('../config');
var displayMessagesVersion = require('../platform/common/displayMessagesVersion');
var mdkpath = require('../mdkpath');

/**
 * Retreives all the properties of a MDK project
 * @param callback Callback(err, infos as object)
 */
function infos( callback ) {

    assert.equal(typeof callback, 'function');

    async.waterfall([
        function(cb) {
            // read project configuration.
            projectConfig.read( function( err, projectConf ) {
                if ( err) {
                    cb(err);
                }
                else {
                    cb(null, projectConf);
                }
            });
        },
    ], function(err, result) {
        callback(err, result);
    });

}

module.exports = infos;
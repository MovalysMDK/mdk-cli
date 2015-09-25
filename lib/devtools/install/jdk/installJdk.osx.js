"use strict"

var fs = require('fs-extra');
var path = require('path');
var async = require('async');

var system = require('../../../utils/system');
var network = require('../../../utils/network');
var config = require('../../../config');

module.exports = {

    /**
     * Check if product installation is ok.
     * @param version
     * @param opts
     * @param callback
     */
    check: function( version, opts, callback ) {
        callback(false);
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>delete old directory if exists</li>
     *     <li>install products in directory config.get("devToolsBaseDir") + toolName + toolVersion.</li>
     * </ul>
     * @param version version of the tool to install
     * @param opts optional parameters
     * @param callback callback
     */
    install: function( toolSpec, opts, callback) {

        var dmgFile = toolSpec.packages[0];

        async.waterfall([
            function(cb) {
                system.spawn('hdiutil', ['attach', dmgFile.cacheFile], cb);
            },
            /*function(cb) {
                system.spawn('xar', ['-xf', '/Volumes/JDK 7 Update 79/JDK 7 Update 79.pkg'], cb);
            },
            function(cb) {
                //cd jdk17079.pkg
            },
            function(cb) {
                system.spawn('cat Payload | gunzip -dc | cpio -i', [], cb);
            },
            function(cb) {
                //cd Contents
                //cp -a Home ~/.mdk/tools/jdk1.7.0_79
                //cd ..
            },
            function(cb) {
                //rm -rf jdk17079.pkg
            },*/
            function(cb) {
                system.spawn('hdiutil', ['detach', dmgFile.opts.osxVolumePath ], cb);
            },
            function(cb) {
                //Save install path in config.
            }

        ], function(err) {
            callback(err);
        });
    }
};
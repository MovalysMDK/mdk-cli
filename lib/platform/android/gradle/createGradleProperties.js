'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');
var mustache = require('mustache');
var url = require("url");

var mdkpath = require('../../../mdkpath');
var system = require('../../../utils/system');
var network = require('../../../utils/network');
var config = require('../../../config');
var getGradlePropertiesFile = require('./getGradlePropertiesFile');

/**
 * Create gradle.properties from template.
 * @param toolSpecs specification of tools
 * @param osName os name
 * @param callback callback
 */
function createGradleProperties(toolSpecs, osName, callback) {

    assert.equal(typeof toolSpecs, 'object');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    var gradlePropertiesTemplateFile = path.join( mdkpath().confDir, "gradle-template.properties");

    async.waterfall([
        function(cb) {
            var configKeys = ["mdk_login", "mdk_password", "mdkRepoRelease", "mdkRepoPluginRelease", "androidSdkPath",
                "snapshotEnable", "mdkRepoSnapshots", "mdkRepoPluginSnapshots"];
            config.getList(configKeys, function(err, objects) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, objects);
                }
            });
        },
        function(objects, cb) {
            network.findProxy(function(err, proxy) {
                if (err) {
                    cb(err);
                }
                else {
                    if ( typeof proxy !== "undefined") {

                        var proxyParse = url.parse(proxy);

                        objects.proxyActive = true ;
                        if ( proxyParse.protocol ) {
                            objects.proxyProtocol = proxyParse.protocol.replace(':','');
                        }
                        objects.proxyHostname = proxyParse.hostname ;
                        objects.proxyPort = proxyParse.port ;
                        if ( proxy.auth ) {
                            var index = proxy.auth.indexOf(':');
                            if (index !== -1) {
                                objects.proxyUsername = proxy.auth.substr(0, index);
                                objects.proxyPassword = proxy.auth.substr(index + 1);
                            }
                        }
                    }
                    cb(null, objects);
                }
            });
        },
        function(objects,cb) {
            fs.readFile(gradlePropertiesTemplateFile, 'utf8', function(err, gradlePropertiesContent) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, gradlePropertiesContent, objects);
                }
            });
        },
        function (gradlePropertiesContent, objects, cb) {
            getGradlePropertiesFile(toolSpecs, osName, function(err, gradlePropertiesFile) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, gradlePropertiesFile, gradlePropertiesContent, objects);
                }
            });
        },
        function(gradlePropertiesFile, gradlePropertiesContent, objects, cb) {
            var content = mustache.render( gradlePropertiesContent, objects);
            fs.writeFile(gradlePropertiesFile, content, function(err) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, gradlePropertiesFile);
                }
            });
        },
        function(gradlePropertiesFile, cb) {
            fs.chmod(gradlePropertiesFile, '0600', cb);
        }
    ], function(err){
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = createGradleProperties;
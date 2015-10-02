'use strict';

var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');
var mustache = require('mustache');
var url = require("url");

var system = require('../../../utils/system');
var network = require('../../../utils/network');
var config = require('../../../config');

/**
* Create maven settings.xml from template.
* @param callback callback
*/
function createSettingsXml(callback) {

    assert.equal(typeof callback, 'function');

    var settingsTemplateFile = path.join( system.userHome(), ".mdk", "conf", "settings-template.xml");
    var settingsFile = path.join( system.userHome(), ".mdk", "conf", "settings.xml");

    async.waterfall([
        function(cb) {
            var configKeys = ["mdk_login", "mdk_password", "mdkRepoRelease", "mdkRepoPluginRelease", "androidSdkPath"];
            config.getList(configKeys, function(err, objects) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, objects);
                }
            });
        },
        function (objects, cb) {
            objects.localRepositoryPath =  path.join( system.userHome(), ".mdk", "data", "m2repo");
            fs.ensureDir(objects.localRepositoryPath, function(err){
                if (err) {
                    cb(err);
                }
                else {
                    cb(null,objects);
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
            fs.readFile(settingsTemplateFile, 'utf8', function(err, settingsTemplateContent) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, settingsTemplateContent, objects);
                }
            });
        },
        function(settingsTemplateContent, objects, cb) {
            var settingsContent = mustache.render( settingsTemplateContent, objects);
            fs.writeFile(settingsFile, settingsContent, function(err) {
                if (err) {
                    callback(err);
                }
                else {
                    callback();
                }
            });
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

module.exports = createSettingsXml;
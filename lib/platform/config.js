'use strict';

var assert = require('assert');
var async = require('async');
var clc = require('cli-color');
var fs = require('fs');
var versions = require ('../mdk/versions');
var mdkLog = require('../utils/log');

var devToolsSpecs = require('../devtools/specs');
var checkPlatform = require('../devtools/check/common/checkPlatform');
var projectConfig = require('../project/config');

var platformConfig = require('./common/config');
var logParam = require('../config/logParam');

var xmldom = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var xpath = require('xpath');

/**
 * List the configuration values for a given platform
 * @param platformName platform
 * @param callback callback
 */
function getConfigList(platformName, callback) {
    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    executeWithProjectPlatformContext(platformName, function(projectConf, projectVersionObject, cb) {
        platformConfig.getPomCustomizableKeysValues(projectVersionObject, platformName, function(err, configValues) {
            if (err) {
				return cb("A problem occurred getting settings values for platform " + projectConf.platformName + ": " + err);
            }

            return cb(null, configValues);
        });
    }, callback);

}

/**
 * Execute the given function after having retrieved the project configuration and the template version.
 * @param platformName
 * @param lastFunction the function to execute with parameters : (err, projectConf, versionObject)
 * @param callback
 */
function executeWithProjectPlatformContext( platformName, lastFunction, callback ) {
    assert.equal(typeof platformName, 'string');
    assert.equal(typeof lastFunction, 'function');
    assert.equal(typeof callback, 'function');

    async.waterfall( [
        function(cb) {
            // check platform is compatible with current os.
            checkPlatform(platformName, cb);
        },
		function(cb){
			// Check that the platform exists
			fs.access('./' + platformName, fs.W_OK | fs.R_OK, function(err){
				if (err){
					return cb("Platform " + platformName + " is unaccessible or has not been added.");
				}
				return cb();
			});
		},
        function(cb) {
            // read project configuration.
            projectConfig.read( function( err, projectConf ) {
                if ( err) {
                    return cb(err);
                }
                else {
                    projectConf.platformName = platformName;
                    return cb(null, projectConf);
                }
            });
        },
        function(projectConf, cb) {
            // Read version file for the current project template version
            versions.get(projectConf.project.mdkVersion, false, function(err, versionObject) {
                if (err) {
                    return cb(err);
                } else {
                    return cb(null, projectConf, versionObject);
                }
            });
        },
        lastFunction
    ], callback);
}

/**
 * Display all the configuration values from given platform
 * @param platformName
 * @param callback
 */
function displayConfigValues(platformName, callback) {
    getConfigList(platformName, function(err, configValues) {
        if (err) {
            return callback(err);
        }

        // Log key/values
        var keys = Object.keys(configValues);
        keys.sort();
        if (keys.length > 0) {
            console.log();
            keys.forEach(function(configValueKey) {
                logParam(configValueKey, configValues[configValueKey], false);
            });
        } else {
            mdkLog.warn("Platform problem", "No key found for platform: " + platformName);
        }
		return callback();
    });
}

/**
 * Set the value of a configuration for the given platform
 * @param platformName
 * @param key to modify
 * @param value to set
 * @param callback
 */
function setConfigValue(platformName, key, value, callback) {
    assert.equal(typeof platformName, 'string');
    assert.equal(typeof key, 'string');
    assert.equal(typeof value, 'string');
    assert.equal(typeof callback, 'function');

    executeWithProjectPlatformContext(platformName, function(projectConf, projectVersionObject, cb) {
        // Is the pom file readable ?
        fs.access(platformName+"/pom.xml",fs.R_OK, function(err) {
            if ( err ) {
                return callback(err);
            }
            // Read the pom.xml file for the given platform
            fs.readFile(platformName+"/pom.xml", 'UTF-8', function(err, data) {
                if (err) {
                    return callback(err);
                }
                // Create a DOM from the file
                var doc = new xmldom().parseFromString(data);

                // Using xpath with a namespace XML is bothersome.
                // Ex in a HTML file with no namespace /html/body/div would
                // become /html:html/html:body/html:div with html namespace
                // So create shortcut and replace automatically in the xpath value.
                //
                // Retrieve namespace
                var namespaceURI = doc.firstChild.namespaceURI;
                // Create and apply a shortcut
                var select = xpath.useNamespaces({"p": namespaceURI});

                // Get value from version file and add namespace shortcut
                var xpathValue = projectVersionObject[platformName]['pom-customizable-keys'][key];
                xpathValue = xpathValue.replace(/\//g,"/p:").replace(/p:\.\./g,"..");

                // Retrieve the node and modify the value
                var pomValueNode = select(xpathValue, doc, true);
                pomValueNode.textContent = value;

                // Serialize back the XML from the DOM and save the file
                var serializer = new XMLSerializer();
                fs.writeFile(platformName+"/pom.xml", serializer.serializeToString(doc), 'UTF-8', cb);
            });
        });
    }, callback);
}


module.exports = {
    getConfigList: getConfigList,
    displayConfigValues: displayConfigValues,
    setConfigValue: setConfigValue
};
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

var assert = require('assert');
var fs = require('fs');
var async = require('async');
var xmldom = require('xmldom').DOMParser;
var xpath = require('xpath');
var mdkLog = require('../../utils/log');

/**
 * Retrieve the values in pom.xml of the keys retrieved from pom-customizable-keys in mdkversions.json for the given platform
 * @param versionObject the project version object
 * @param callback
 */
function getPomCustomizableKeysValues( versionObject, platformName, callback ) {
    assert.equal(typeof versionObject, 'object');
    assert.equal(typeof platformName, 'string');
    assert.equal(typeof callback, 'function');

    // Open the platform pom and list the values of the pom-customizable-keys attribute for the given platform
    fs.access(platformName+"/pom.xml",fs.R_OK, function(err) {
        if ( err ) {
            return callback("The POM file is does not exist or is not accessible for the platform " + platformName);
        }
        fs.readFile(platformName+"/pom.xml", 'UTF-8', function(err, data) {
            if (err) {
                return callback(err);
            }
            var doc = new xmldom().parseFromString(data);

            // Retrieve namespace
            var namespaceURI = doc.firstChild.namespaceURI;
            // Create a shortcut
            var select = xpath.useNamespaces({"p": namespaceURI});

            // Retrieve pom.xml values from keys.
            var configValues = {};
            if (versionObject[platformName] && versionObject[platformName]['pom-customizable-keys']) {
                async.forEachOf(versionObject[platformName]['pom-customizable-keys'], function (value, key, eachOfCb) {
                    // Add the namespace to the value, to be able to xpath
                    value = value.replace(/\//g,"/p:").replace(/p:\.\./g,"..");


                    var pomValueNode = select(value+"/text()", doc, true);
                    if (pomValueNode) {
                        configValues[key] = pomValueNode.nodeValue;
                    } else {
                        mdkLog.warn("pom.xml analyze", "Couldn't find the key: " + key+" defined in template version");
                    }

                    eachOfCb();
                }, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, configValues);
                    }
                });
            } else {
                callback(null, configValues);
            }
        });
    });
}

module.exports = {
    getPomCustomizableKeysValues: getPomCustomizableKeysValues
};
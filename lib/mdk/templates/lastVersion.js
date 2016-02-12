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
"use strict";

var assert = require('assert');
var async = require('async');

var config = require('../../config/index');
var list = require('./list');
var semver = require('semver');

/**
 * Return the last version for a given template
 * @param templateName The name of the template to use
 * @callback callback
 */
function lastVersion(templateName ,callback) {

    //Check parameters
    assert.equal(typeof templateName, 'string');
    assert.equal(typeof callback, 'function');

    list(false, function(err, templateObject) {
        if (err) {
            callback(err);
        } else {
            var lastVersionObject = {version:'0.0.0-fake'};
            templateObject.templates.forEach(function (template) {
                // Focus on the required template
                if (template.name === templateName) {
                    // Search the SNAPSHOT or greater version
                    template.versions.forEach(function (versionObject) {
                        if (semver.gt(versionObject.version, lastVersionObject.version)) {
                            lastVersionObject = versionObject;
                        }
                    });
                }
            });

            if (lastVersionObject.version !== '0.0.0-fake') {
                callback(null, lastVersionObject);
            } else {
                callback("No version where found for template : " + templateName);
            }
        }
    });
}

module.exports = lastVersion;
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
var semver = require('semver');

var load = require('./load');

/**
 * Return version info of mdk
 * @param templateName Name of the template to get
 * @param forceUpdate Indicates if an update must be forced
 * @param callback
 */
function get(templateName, forceUpdate, callback) {

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof templateName, 'string');
    assert.equal(typeof callback, 'function');

    //Check given version format
    //Load mdk
    load(forceUpdate, function(err, templates) {
        if (err) {
            callback(err);
        }
        else {
            retrieveTemplate(templateName, templates, callback);
        }
    });
}

/**
 * Retrieve a specific version of MDK
 * @param templateName Name of the template to get
 * @param allTemplates All templates found from mdktemplates files
 * @param callback Callback
 */
function retrieveTemplate(templateName, allTemplates, callback) {

    //Check parameters
    assert.equal(typeof templateName, 'string');
    assert.equal(typeof allTemplates, 'object');
    assert.equal(typeof callback, 'function');

    //Retrieve specific version
    var foundItem;
    allTemplates.templates.forEach(function(item) {
        if(item.name === templateName) {
            foundItem = item;
        }
    });
    if(foundItem) {
        callback(null, foundItem);
    }
    else {
        callback("MDK Template with name '" + templateName + "' not found");
    }
}

module.exports = get;

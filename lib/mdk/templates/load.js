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

var fs = require('fs-extra');
var assert = require('assert');
var path = require('path');
var async = require('async');
var clc = require('cli-color');
var async = require('async');

var versions = require('../versions');
var io = require('../../utils/io/index');
var config = require('../../config/index');
var network = require('../../utils/network/index');
var system = require('../../utils/system/index');
var mdkpath = require('../../mdkpath');

var mdk = require('../commons');

/**
 * Load mdk of mdk.
 * <p>A template has the following structure:</p>
 * <code>{
 *  "name":"MDK Basic",
    "default":true,
    "platforms":[
        {...}
    ],
    "versions":[
        {... },
    ]
    }
 </code>
 * @param forceUpdate force checking for a new mdkversions file on mdk website.
 * @param callback
 */
function load(forceUpdate, callback) {
    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');
    mdk.load(forceUpdate, __dirname, "mdktemplates.json", function (error, templatesObject) {
        if(error) {
            callback(error);
        } else {
            fillTemplates(templatesObject, callback);
        }
    });
}

/**
 * Fill templates with implicit values not specified in the mdktemplates.json file
 * @param templates The object to fill
 * @callback callback
 */
function fillTemplates(templatesObject, callback) {
    //check parameters
    assert(typeof templatesObject === 'object');

    async.forEachSeries(templatesObject.templates, function (aTemplate, templateCb) {
        async.forEachSeries(aTemplate.versions, function (aVersion, versionCb) {
            if(typeof aVersion.mdkVersion === 'undefined') {
                aVersion.mdkVersion = aVersion.version;
            }

            versions.get(aVersion.mdkVersion, false, function(err, result) {
                if(err) {
                    aVersion.devToolsVersion = 'undefined';
                }
                else {
                    aVersion.devToolsVersion = result.devToolsVersion;
                }
                versionCb();
            });
        }, templateCb);
    }, function (err) {
        callback(err, templatesObject);
    });

}


module.exports = load;
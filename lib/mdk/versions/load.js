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

var io = require('../../utils/io/index');
var config = require('../../config/index');
var network = require('../../utils/network/index');
var system = require('../../utils/system/index');
var mdkpath = require('../../mdkpath');

var mdk = require('../commons');

/**
 * Load mdk of mdk.
 * <p>A version has the following structure:</p>
 * <code>{
		version: 5.0.1,
		messages: [
			{ text: "",
			  level: "" }
	    ],
		devToolsVersion: 2.0.0
	}</code>
 * @param forceUpdate force checking for a new mdkversions file on mdk website.
 * @param callback
 */
function load(forceUpdate, callback) {
    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');
    mdk.load(forceUpdate, __dirname, "mdkversions.json", callback);
}


module.exports = load;
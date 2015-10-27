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
    mdk.load(forceUpdate, __dirname, "mdktemplates.json", callback);
}

module.exports = load;
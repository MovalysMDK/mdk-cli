"use strict";

var assert = require('assert');
var semver = require('semver');

var load = require('./load');


/**
 * Return version info of mdk
 * @param forceUpdate Indicates if an update must be forced
 * @param callback
 */
function getDefault(forceUpdate, callback) {

    //Check parameters
    assert.equal(typeof forceUpdate, 'boolean');
    assert.equal(typeof callback, 'function');

    //Check given version format
    //Load mdk
    load(forceUpdate, function(err, templates) {
        if (err) {
            callback(err);
        }
        else {
            retrieveTemplate(templates, callback);
        }
    });
}

/**
 * Retrieve a specific version of MDK
 * @param allTemplates All templates found from mdktemplates files
 * @param callback Callback
 */
function retrieveTemplate(allTemplates, callback) {

    //Check parameters
    assert.equal(typeof allTemplates, 'object');
    assert.equal(typeof callback, 'function');

    //Retrieve specific version
    var foundItem;
    allTemplates.templates.forEach(function(item) {
        if(item.default === true) {
            foundItem = item;
        }
    });
    if(foundItem) {
        callback(null, foundItem);
    }
    else {
        callback("MDK Default Template not found");
    }
}

module.exports = getDefault;

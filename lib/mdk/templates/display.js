"use strict";

var clc = require('cli-color');
var assert = require('assert');

/**
 * Display a MDK version infos
 * @param templatesObject The MDK version object
 * @param showDetails Indicates if details of templates should be printed
 * @param callback Callback
 */
function displayVersionInfos(templatesObject, showDetails, callback) {

    //Check parameters
    assert.equal(typeof templatesObject, 'object');
    assert.equal(typeof callback, 'function');

    //Prints version infos

    if(showDetails) {
        printDetailsTemplates(templatesObject);
    }
    else {
        templatesObject.templates.forEach(function (aTemplate) {
            console.log(clc.bold("* " + aTemplate.name + " : ") + aTemplate.versions[0].version);
        });
        console.log("");
    }
    callback();
}

function printDetailsTemplates(templatesObject) {
    templatesObject.templates.forEach(function (aTemplate) {
        console.log(clc.bold(aTemplate.name));
        aTemplate.versions.forEach(function(aVersion) {
            if(aTemplate.versions.indexOf(aVersion) === 0) {
                console.log(clc.green(aVersion.version));
            }
            else {
                console.log(aVersion.version);
            }
        });
        console.log("");
    });
}

module.exports = displayVersionInfos;
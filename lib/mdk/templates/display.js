"use strict";

var clc = require('cli-color');
var assert = require('assert');
require('console.table');

/**
 * Display a MDK template infos
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
    assert(typeof templatesObject, 'object');
    console.log("");

    //Log for each template
    templatesObject.templates.forEach(function (aTemplate) {
        console.log(clc.bold.green('***************************************'));
        console.log(clc.bold.green(aTemplate.name), aTemplate.default === true ? clc.blue.bold('(default)') : "" );
        console.log(clc.bold.green('***************************************'));
        console.log(clc.bold("Supported platforms : "), clc(supportedPlatformForTemplate(aTemplate)));
        console.log("");
        console.table(clc.bold("Versions : "), versionsForTemplate(aTemplate));
        console.log("");
    });
}

function supportedPlatformForTemplate(template) {
    //Check parameters
    assert(typeof template, 'object');

    //Create platforms array
    var platforms = [];
    template.platforms.forEach(function (aPlatform) {
        platforms.push(aPlatform.name);
    });
    return platforms;
}

function versionsForTemplate(template) {
    //Check parameters
    assert(typeof template, 'object');

    //Create versions array
    var versions = [];
    template.versions.forEach(function (aVersion) {
        var versionObject = {};
        versionObject.templateVersion = aVersion.version;

        //If MDK version is not specified, it's the same of templateVersion
        if(typeof aVersion.mdkVersion === 'undefined') {
            aVersion.mdkVersion = aVersion.version;
        }
        versionObject.mdkVersion = aVersion.mdkVersion;
        versions.push(versionObject);
    });
    return versions;
}
module.exports = displayVersionInfos;
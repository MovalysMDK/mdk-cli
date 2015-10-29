"use strict";

var clc = require('cli-color');
var assert = require('assert');
var semver = require('semver');
var async = require('async');

var lastTemplateVersion = require('./lastVersion');
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

    //Prints template infos
    if(showDetails) {
        printDetailsTemplates(templatesObject, callback);
    } else {
        async.forEachSeries(templatesObject.templates, function (aTemplate, cb) {
            lastTemplateVersion(aTemplate.name,function (err, lastVersion) {
                if (err) {
                    console.log(clc.bold("* " + aTemplate.name + " : Not found"));
                } else {
                    console.log(clc.bold("* " + aTemplate.name + "(" + lastVersion.version + ") : ") + aTemplate.description);
                }
                cb();
            });
        }, callback);

        console.log("");
    }
}

/**
 * Print templates details
 * @param templatesObject The object that describes all templates
 * @callback callback
 */
function printDetailsTemplates(templatesObject, callback) {
    assert(typeof templatesObject, 'object');
    console.log("");

    async.forEachSeries(templatesObject.templates, function (aTemplate, cb) {
        console.log(clc.bold.green('***************************************'));
        console.log(clc.bold.green(aTemplate.name), aTemplate.default === true ? clc.cyan.bold('(default)') : "" );
        console.log(clc.bold.green('***************************************'));
        console.log(clc.bold(aTemplate.description));
        console.log(clc.bold("Supported platforms : "), clc(supportedPlatformForTemplate(aTemplate)));
        console.log("");
        console.table(clc.bold("Versions : "), versionsForTemplate(aTemplate));
        console.log("");
        cb();
    }, callback);
}

/**
 * Returns an array containing all supported platform given a template
 * @param template The template to analyze
 * @returns {Array} An array containing all supported platform given a template
 */
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

/**
 * Returns an array containing the versions of the given template and
 * its associated MDK versions
 * @param template The template to analyze
 * @returns {Array} An array containing the versions of the given template and
 * its associated MDK versions
 */
function versionsForTemplate(template) {
    //Check parameters
    assert(typeof template, 'object');

    //Create versions array
    var versions = [];
    template.versions.forEach(function (aVersion) {
        var versionObject = {};
        versionObject.templateVersion = aVersion.version;

        //If MDK version is not specified, it's the same of templateVersion
        versionObject.mdkVersion = aVersion.mdkVersion;
        versionObject.devToolsVersion = aVersion.devToolsVersion;
        versions.push(versionObject);
    });
    // Sort by version
    versions.sort(function (v1,v2) {return semver.rcompare(v1.templateVersion, v2.templateVersion);});
    return versions;
}
module.exports = displayVersionInfos;
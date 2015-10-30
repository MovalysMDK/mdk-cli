"use strict";

var mdkLog = require('../../utils/log');
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

    console.log("");
    //Prints template infos
    if(showDetails) {
        printDetailsTemplates(templatesObject, callback);
    } else {
        async.forEachSeries(templatesObject.templates, function (aTemplate, cb) {
            lastTemplateVersion(aTemplate.name,function (err, lastVersion) {
                if (err) {
                    console.log(clc.bold("* " + aTemplate.name + " : Not found"));
                    console.log();
                } else {
                    console.log(clc.bold("* " + aTemplate.name + "(" + lastVersion.version + ")") + defaultIndicator(aTemplate) + demoIndicator(aTemplate) );
                    console.log("  " + aTemplate.description);
                    console.log();
                }
                cb();
            });
        }, callback);

    }
}

/**
 * Print templates details
 * @param templatesObject The object that describes all templates
 * @callback callback
 */
function printDetailsTemplates(templatesObject, callback) {
    assert(typeof templatesObject, 'object');

    async.forEachSeries(templatesObject.templates, function (aTemplate, cb) {
        mdkLog.separator();
        console.log(clc.bold.green(aTemplate.name), defaultIndicator(aTemplate), demoIndicator(aTemplate));
        mdkLog.separator();
        console.log(clc.bold(aTemplate.description));
        console.log(clc.bold("Supported platforms : "), clc(supportedPlatformForTemplate(aTemplate)));
        if (typeof aTemplate.demo != 'undefined') {
            printDemoSpecifics(aTemplate);
        }
        console.log("");
        console.table(clc.bold("Versions : "), versionsForTemplate(aTemplate));
        console.log("");
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

/**
 * Returns a string indicator if the given template is the default template
 * @param aTemplate The template to check
 * @returns a string indicator if the given template is the default template
 */
function defaultIndicator(aTemplate) {
    return (aTemplate.default === true ? clc.cyan.bold('(default)') : "");
}

/**
 * Returns a string indicator if the given template is a demo template
 * @param aTemplate The template to check
 * @returns a string indicator if the given template is a demo template
 */
function demoIndicator(aTemplate) {
    return ((typeof aTemplate.demo != 'undefined') ? clc.yellow.bold('(demo)') : "");
}

/**
 * Print demo version specifics
 * @param aTemplate The demo template
 */
function printDemoSpecifics(aTemplate) {
    if(typeof aTemplate.demo.applicationId != 'undefined') {
        console.log(clc.yellow.bold("This template can only be used with this applicationID value : ")+ "'"+ aTemplate.demo.applicationId + "'");
    }
}
module.exports = displayVersionInfos;
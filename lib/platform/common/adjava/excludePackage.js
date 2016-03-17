"use strict"

var fs = require('fs-extra');
var replaceInFile = require('../../../utils/io/replaceInFile');
var path = require('path');

function excludePackage( conf, cb) {

    // Search Position In File
    var searchPositionInFile = "</configFiles>";

    // Insert Exclude In File
    if (conf.umlExcludes && conf.umlExcludes[conf.platformName] && conf.umlExcludes[conf.platformName].length > 0) {
        var packageExcludes = conf.umlExcludes[conf.platformName];
        console.log('  modify pom project - include umlExcludes');
        var includeExcludePackage = "</configFiles>\n<umlExcludes>";

        for (var i = 0; i < packageExcludes.length; i++) {
            includeExcludePackage += "\n<umlExclude>";
            includeExcludePackage += packageExcludes[i];
            includeExcludePackage += "</umlExclude>";
        }
        includeExcludePackage += "\n</umlExcludes>";

        // Replace String In File
        replaceInFile(path.join(conf.platformName,'pom.xml'), searchPositionInFile, includeExcludePackage, cb);
    }
    else {
        cb();
    }
}

module.exports = excludePackage;
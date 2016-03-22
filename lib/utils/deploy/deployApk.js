"use strict"

var fs = require('fs-extra');
var async = require('async');
var path = require('path');

var buildNumber = require('./buildNumber');
var copyFile = require('../io/copyFile');
var linkForceAsync = require('../io/linkForceAsync');

function deployApk( apkFileName, deployDir, conf, callback ) {

    var buildNr = buildNumber();
    var apkName = conf.project.artifactId + '-' + buildNr + '.apk';

    async.series([
        function(cb) {
            fs.mkdirs(deployDir + '/' + conf.project.artifactId, cb );
        },
        // function(cb) {
        //     fs.writeFileSync(path.join(deployDir, conf.project.artifactId, conf.project.artifactId + '.apk'), buildNr);
        //     copyFile( apkFileName, deployDir + '/' + conf.project.artifactId + '/' + apkName);
        //     fs.symlink( deployDir + '/' + conf.project.artifactId + '/' + apkName,
        //          deployDir + '/' + conf.project.artifactId + '/' + conf.project.artifactId + '.apk', null, cb);
        // },
        function(cb) {
            copyFile( apkFileName, deployDir + '/' + conf.project.artifactId + '/' + apkName);
            cb();
        },
        // function(cb) {
        //     linkForceAsync( deployDir + '/' + conf.project.artifactId + '/' + apkName,
        //             deployDir + '/' + conf.project.artifactId + '/' + conf.project.artifactId + '.apk', null, cb);
        // },
        function(cb) {
            fs.writeFile( deployDir + '/' + conf.project.artifactId + '/version', buildNr, null, cb);
        },
        function(cb) {
            fs.writeFile( deployDir + '/' + conf.project.artifactId + '/mdk_version', conf.project.mdkVersion, null, cb);
        }
    ],
    function(err, results) {
        if ( err) {
            callback(err);
        }
        else {
            callback();
        }
    });
}

module.exports = deployApk;
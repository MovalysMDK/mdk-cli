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
var async = require('async');

var runAsync = require('../runAsync');
var buildNumber = require('./buildNumber');
var linkForceAsync = require('../io/linkForceAsync');

function buildIpa( conf, appDir, ipaDir, deploy, deployDir, baseUrl, callbackGen ) {

	console.log('  build ipa');
    var buildNr = buildNumber();

    var ipaName = conf.project.artifactId + '-' + buildNr + '.ipa';
    var ipaPlistName = conf.project.artifactId + '-' + buildNr + '.plist';

    async.waterfall([
        // function(callback){
            // runAsync('/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" ' + appDir + '/Info.plist', 'error: read app version failed',
            //     function(err, result) {
            //     if ( err ) {
            //         callback(err);
            //     }
            //     else {
            //         var appVersion = result.trim();
            //         callback(null, appVersion);
            //     }
        //     });
        // },
        // function(appVersion, callback){
        //     runAsync('/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" ' + appDir + '/Info.plist',
        //         'error: read app identi(fier failed', function(err, result) {
        //         if ( err ) {
        //             callback(err);
        //         }
        //         else {
        //             var appIdentifier = result.trim();
        //             callback(null, appVersion, appIdentifier);
        //         }
        //     });
        // },
        function(callback){
            var xcrunCmd = '/usr/bin/xcrun -sdk iphoneos PackageApplication -v ' + appDir + ' -o ' + deployDir + '/' + ipaName ;
            runAsync(xcrunCmd, 'error: xcrun failed', function(err, result) {
                if ( err ) {
                    callback(err);
                }
                else {
                    callback(null);
                }
            });
        }//,
        // function(appVersion, appIdentifier, callback){
        //     //console.log('    write file ' + ipaPlistName);
        //     fs.writeFileSync(ipaDir + "/" + ipaPlistName,
        //         computeApplicationPlist( appIdentifier, appVersion, conf.project.artifactId, baseUrl ));
        //     if ( deploy ) {
        //         console.log('  deploy ipa');

        //         async.series([
        //             function(cb) {
        //                 fs.mkdirs(deployDir + '/' + conf.project.artifactId, cb );
        //             },
        //             function(cb) {
        //                 fs.writeFile( deployDir + '/' + conf.project.artifactId + '/' + ipaName,
        //                     fs.readFileSync( ipaDir + '/' + ipaName ),
        //                     null, cb);
        //             },
        //             function(cb) {
        //                 fs.writeFile( deployDir + '/' + conf.project.artifactId + '/' + ipaPlistName,
        //                     fs.readFileSync( ipaDir + '/' + ipaPlistName ),
        //                     null, cb);
        //             },
        //             function(cb) {
        //                 linkForceAsync( deployDir + '/' + conf.project.artifactId + '/' + ipaName,
        //                         deployDir + '/' + conf.project.artifactId + '/' + conf.project.artifactId + '.ipa', null, cb);
        //             },
        //             function(cb) {
        //                 linkForceAsync( deployDir + '/' + conf.project.artifactId + '/' + ipaPlistName,
        //                         deployDir + '/' + conf.project.artifactId + '/' + conf.project.artifactId + '.plist', null, cb);
        //             },
        //             function(cb) {
        //                 fs.writeFile(deployDir + '/' + conf.project.artifactId + '/version', buildNr, null, cb);
        //             },
        //             function(cb) {
        //                 fs.writeFile(deployDir + '/' + conf.project.artifactId + '/mdk_version', conf.project.mdkVersion, null, cb);
        //             }
        //         ],
        //         function(err, results){
        //             if ( err) {
        //                 callback(err);
        //             }
        //             else {
        //                 callback();
        //             }
        //         });
        //     }
        //     else {
        //         callback();
        //     }
        // }
    ],
    function(err, results){
        if ( err) {
            callbackGen(err);
        }
        else {
            callbackGen(err, results);
        }
    });
}

function computeApplicationPlist( appIdentifier, appVersion, appName, baseUrl ) {
    return '<?xml version="1.0" encoding="UTF-8"?>' +
        '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' +
        '<plist version="1.0">'+
        '<dict>' +
        '    <key>items</key>' +
        '    <array>' +
        '        <dict>' +
        '            <key>assets</key>' +
        '            <array>' +
        '                <dict>' +
        '                    <key>kind</key>' +
        '                    <string>software-package</string>' +
        '                    <key>url</key>' +
        '                    <string>' + baseUrl + '/' + appName + '/' + appName + '.ipa</string>' +
        '                </dict>' +
        '           </array>' +
        '          <key>metadata</key>' +
        '            <dict>' +
        '                <key>bundle-identifier</key>' +
        '                <string>' + appIdentifier + '</string>' +
        '                <key>bundle-version</key>' +
        '                <string>' + appVersion + '</string>' +
        '                <key>kind</key>' +
        '                <string>software</string>' +
        '                <key>title</key>' +
        '               <string>' + appName + '</string>' +
        '            </dict>' +
        '        </dict>' +
        '    </array>' +
        '</dict>' +
        '</plist>';
}

module.exports = buildIpa;
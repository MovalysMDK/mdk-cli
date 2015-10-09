"use strict";

var clc = require ('cli-color');
var system = require('../../../utils/system');

module.exports = {

    /**
     * Check if require is ok.
     * @param checkSpec check specification
     * @param devToolsSpec environment specification
     * @param osName osName
     * @param platform mobile platform
     * @param callback callback
     */
    check: function (checkSpec, devToolsSpec, osName, platform, callback) {

        // try to download a jar of the mdk of the framework
        var cmd = 'mvn';
        var params = [
            'org.apache.maven.plugins:maven-dependency-plugin:2.8:get',
            '-DremoteRepositories=https://artifactory.movalys.sopra.com/artifactory/api/npm/prj-mdk-releases',
            '-Dartifact=com.adeuza.movalysfwk.mf4jcommons:mf4jcommons-core:3.0.9',
            '-Dmaven.wagon.http.ssl.insecure=true',
            '-Dmaven.wagon.http.ssl.allowall=true'
        ];

        system.spawn(cmd, params, function (err, output) {

            if (err) {
                console.log(clc.red('[KO]') + ' fail to download an artifact from mdk artifactory. Check settings.xml is ok : ' + err);
                callback('error');
            }
            else {
                console.log(clc.green('[OK]') + ' access to mdk framework (artifactory)');

                var cmd = 'mvn';
                var params = [
                    'org.apache.maven.plugins:maven-dependency-plugin:2.8:get',
                    '-DremoteRepositories=https://artifactory.movalys.sopra.com/artifactory/api/npm/prj-mdk-releases',
                    '-Dartifact=com.adeuza:adjava-android:6.4.0',
                    '-Dmaven.wagon.http.ssl.insecure=true',
                    '-Dmaven.wagon.http.ssl.allowall=true'
                ];

                system.spawn(cmd, params, function (err, output) {

                    if (err) {
                        console.log(clc.yellow('[Notice]') + ' you are not allowed to use MDK AGL');
                        callback();
                    }
                    else {
                        console.log(clc.green('[OK]') + ' access to mdk agl (artifactory)');
                        callback();
                    }
                });
            }
        });
    }
}
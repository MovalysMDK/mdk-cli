'use strict';

var spawn = require('../../system/spawn');

function revert( baseDir, files, recursive, callback ) {

    var popDir = process.cwd();
    process.chdir(baseDir);

    var params = ["revert", "--non-interactive"];
    if ( recursive) {
        params.push("--depth");
        params.push("infinity");
    }
    params = params.concat(files);
    spawn( 'svn', params, function(err,stdout) {
        process.chdir(popDir);
        if ( err ) {
            callback(err);
        }
        else {
            callback(null,stdout);
        }
    });
}

module.exports = revert;
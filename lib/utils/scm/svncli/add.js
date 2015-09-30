'use strict';

var spawn = require('../../system/spawn');

function add( baseDir, files, recursive, callback ) {

    var popDir = process.cwd();
    process.chdir(baseDir);

    var params = ["add", "--non-interactive"];
    if ( !recursive) {
        params.push("--non-recursive");
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

module.exports = add;
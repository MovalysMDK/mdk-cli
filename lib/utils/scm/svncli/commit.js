'use strict'

var spawn = require('../../system/spawn');

function commit( baseDir, files, message, callback ) {

    var popDir = process.cwd();
    process.chdir(baseDir);

    var params = ["commit", "--non-interactive", "-m", message];
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

module.exports = commit;
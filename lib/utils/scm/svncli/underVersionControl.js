'use strict';

var spawn = require('../../system/spawn');

function underVersionControl( dir, callback ) {

    var popDir = process.cwd();
    process.chdir(dir);

    var params = ["info"];
    spawn( 'svn', params, function(err,stdout) {
        process.chdir(popDir);
        if ( err ) {
            callback(false);
        }
        else {
            callback(true);
        }
    });
}

module.exports = underVersionControl;

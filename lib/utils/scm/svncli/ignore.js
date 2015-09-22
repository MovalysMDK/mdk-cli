'use strict'

var fs = require('fs');

var spawn = require('../../system/spawn');

function ignore( baseDir, files, callback ) {

    var popDir = process.cwd();
    process.chdir(baseDir);

    var fileContent = files[0];
    for(var i = 1; i< files.length; i++) {
        fileContent += "\n" + files[i];
    }

    fs.writeFile('.tmp', fileContent, function (err) {
        if (err) {
            callback(err)
        }
        else {
            var params = ["propset", "svn:ignore", "-F", ".tmp", "."];
            spawn( 'svn', params, function(err,stdout) {
                fs.unlinkSync(".tmp");
                process.chdir(popDir);
                if ( err ) {
                    callback(err);
                }
                else {
                    callback(null, stdout);
                }
            });
        }
    });
}

module.exports = ignore;
'use strict';
var fs = require('fs');
var path = require('path');

var logDir = process.cwd();
console.log("entering send log module :" + logDir);

sendLog();

function sendLog() {

    console.log("entering send log :" + logDir);
    // var logDir = path.join(mdkpath().tmpDir,'analytics');
    
    var list = [];

    fs.readdir( logDir, function( err, files ) {
        if( err ) {
            console.log(err);
            process.exit(1);
        } 
        files.forEach( function( file, index ) {
            list = list.concat(JSON.parse(fs.readFileSync( path.join(logDir,file),{encoding:'utf8'})));
        });
        console.log(JSON.stringify(list));
        
        files.forEach( function( file, index ) {
            fs.unlink(path.join(logDir,file),function(err) {
                process.exit();
            });
        });

        process.exit();
    });
}


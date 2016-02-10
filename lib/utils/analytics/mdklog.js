'use strict';

var mdkpath = require('../../mdkpath');
var fs = require('fs');
var path = require('path');
var config = require('../../config');
var async = require('async');
var fork = require('child_process').fork;

function mdklog(command,callback) {
    
    var logDir = path.join(mdkpath().tmpDir,'analytics');
    fs.access(logDir, fs.F_OK, function(err) {
        if (err) {
            fs.mkdirSync(logDir);
        }
    });
    var log = {};
    var d = new Date();
    log['time'] = d.getTime();
    log['command'] = command;
    
    var logFileName = path.join(logDir,d.getDate() +'_'+ d.getMonth() +'_'+ d.getFullYear() + '-' + 
                                d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds() + '.json');

    config.get("mdk_login", function(err, username ) {
        if (err) {
            console.log(err);
        }
        else {
            log['user'] = username;
            fs.writeFileSync(logFileName,JSON.stringify(log));
            
            console.log("forking : " + __dirname +'\\sendLog cwd:' + logDir);
            var child = fork(__dirname + '/sendLog',[],{
                cwd:logDir,
                stdio:'ignore',
                detached: true,
                execArgv: ['--debug=5860']}
            );
            child.unref();
            console.log("forked .");
            setTimeout(callback,1000);
            // callback();
        }
    });
}

function sendLog() {
    var logDir = path.join(mdkpath().tmpDir,'analytics');
    
    var list = [];
    
    fs.readdir( logDir, function( err, files ) {
        if( err ) {
            console.log(err);
            process.exit(1);
        } 
        files.forEach( function( file, index ) {
            list = list.concat(JSON.parse(fs.readFileSync( path.join(logDir,file),{encoding:'utf8'})));
        });
        console.log(list + "");
        
        files.forEach( function( file, index ) {
            fs.unlink(path.join(logDir,file),function(err) {});
        });
        
        
    });
}

module.exports = mdklog;
'use strict';

var mdkpath = require('../../mdkpath');
var fs = require('fs');
var path = require('path');
var config = require('../../config');
var async = require('async');
var fork = require('child_process').fork;

function mdklog(command,callback) {
    
    config.get('mdk_analytics_enabled',function(err, res) {
        if (err) {
            return callback();
        }
        if (res === "true")
        {
            var logDir = path.join(mdkpath().userHome,'analytics');
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
                    // console.log(err);
                }
                else {
                    log['user'] = username;
                    fs.writeFileSync(logFileName,JSON.stringify(log));
                    
                    if (err ||!res) {
                        return callback();
                    }
                    var child = fork(__dirname + '/sendLog',[],{
                        cwd:logDir,
                        stdio:'ignore',
                        detached: true,
                        execArgv: ['--debug=5860']}
                    );
                    child.unref();
                    // let the child the time to be well formed
                    setTimeout(callback,1000);
                }
            });
        }
        else {
            return callback();
        }
    });
}

module.exports = mdklog;
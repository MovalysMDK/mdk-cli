'use strict';
var fs = require('fs');
var path = require('path');

var thrift = require('thrift');
// var ThriftTransports = require('thrift/transport');
// var ThriftProtocols = require('thrift/protocol');
var Analytics = require('./gen-nodejs/Analytics');
var atypes = require('./gen-nodejs/analytics_types');


var logDir = process.cwd();

sendLog();

function sendLog() {
    
    var list = [];

    fs.readdir( logDir, function( err, files ) {
        if( err ) {
            // console.log(err);
            process.exit(1);
        } 
        files.forEach( function( file, index ) {
            list = list.concat(JSON.parse(fs.readFileSync( path.join(logDir,file),{encoding:'utf8'})));
        });
    
        
        var transport = thrift.TBufferedTransport;
        var protocol = thrift.TBinaryProtocol;

        var connection = thrift.createConnection("localhost", 9090, {
        transport : transport,
        protocol : protocol
        });
        
        connection.on('error', function(err) {
            // console.error(err.stack);
            // console.log('connection error send :' + err);
            // console.log(err);
            connection.end();
            process.exit();
        });

        var client = thrift.createClient(Analytics, connection);

        client.sendData(JSON.stringify(list), function(err) {
            if (err && err.type!==0) {
                console.error(err.stack);
                console.log('err send :' + err);
                console.log(err);
                connection.end();
                process.exit();
            }
            else {
                files.forEach( function( file, index ) {
                    fs.unlink(path.join(logDir,file),function(err) {
                        if (err) {
                            console.log('err unlink : ' + err);
                        }
                        connection.end();
                        process.exit();
                    });
                });
            }
        });
    });
}


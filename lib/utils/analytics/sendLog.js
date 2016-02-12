/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
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


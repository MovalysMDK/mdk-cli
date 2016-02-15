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
var request = require('request');

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
        
        
        var jsonData = JSON.stringify(list);
        var options = {
            uri: 'http://localhost:3000/sendData',
            method: 'POST',
            json: {
                jsonData
            }
        };
    
        request(options, function(error, response, body) {
            if (!error && response.statusCode ==200) {
                console.log("request ok")
                files.forEach( function( file, index ) {
                    fs.unlink(path.join(logDir,file),function(err) {
                        if (err) {
                            console.log('err unlink : ' + err);
                        }
                    });
                });
            }
            else {
                console.log(error);
            }
        })
    });
}


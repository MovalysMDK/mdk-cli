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

process.on('uncaughtException', function(err){
  fs.appendFileSync('../err.out','uncaughtException: ' + err.message);
  fs.appendFileSync('../err.out',err.stack);
  process.exit(1);
});

sendLog();

function sendLog() {
    
    fs.appendFileSync('../err.out','send start\n');
    
    var list = [];
    fs.readdir( logDir, function( err, files ) {
        if( err ) {
            process.exit(1);
        } 
        files.forEach( function( file, index ) {
            list = list.concat(JSON.parse(fs.readFileSync( path.join(logDir,file))));
        });
        
        
        var jsonData = JSON.stringify(list);
        var options = {
            followRedirect: true,
            strictSSL: false,
            method: 'POST',
            json: {
                jsonData
            }
        };
        
        fs.appendFileSync('../err.out','data to send : ' + jsonData.toString() + '\n');
        
        options.uri = process.argv[2];
        if (process.argv[3]) { 
            options.proxy = process.argv[3];
        }
        
        fs.appendFileSync('../err.out','request options : ' + JSON.stringify(options) + '\n');
        
        request(options).on('response', function(response) {
            fs.appendFileSync('../err.out','response received:' + response.statusCode + '\n');
            if (response.statusCode ==200) {
                
                fs.appendFileSync('../err.out','Deleting...\n');
                
                files.every( function( file, index ) {
                        fs.unlinkSync(path.join(logDir,file));
                        return true;
                    });
            }
            else {
                fs.appendFileSync('../err.out','request error\n');
            }
        })
        .on('response', function(response) {
            fs.appendFileSync('../err.out','request error:' + JSON.stringify(response) + '\n');
        });
    });
}


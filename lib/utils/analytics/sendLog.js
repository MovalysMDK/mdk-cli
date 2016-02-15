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

fs.appendFileSync('../err.out','sendLog !!\n');
sendLog();

function sendLog() {
    var list = [];
    fs.appendFileSync('../err.out','sendLog :' + logDir + '\n');
    fs.readdir( logDir, function( err, files ) {
        if( err ) {
            fs.appendFileSync('../err.out',err + '\n');
            // process.exit(1);
        } 
        fs.appendFileSync('../err.out','sendLog files :' + files + '\n');
        files.forEach( function( file, index ) {
            list = list.concat(JSON.parse(fs.readFileSync( path.join(logDir,file)/*,{encoding:'utf8'}*/)));
            fs.appendFileSync('../err.out','sendLog file :' + file + '\n');
        });
        fs.appendFileSync('../err.out','sendLog files list :' + list + '\n');
        
        
        var jsonData = JSON.stringify(list);
        var options = {
            uri: 'http://localhost:3000/sendData',
            method: 'POST',
            json: {
                jsonData
            }
        };
    
        fs.appendFileSync('../err.out',"sending jsonData :" + jsonData);
        request(options, function(error, response, body) {
            fs.appendFileSync('../err.out','request !!!\n');
            if (!error && response.statusCode ==200) {
                fs.appendFileSync('../err.out','request response : ' + response + '\n');
                 if (files.every( function( file, index ) {
                        fs.appendFileSync('../err.out','delete ' + file +'\n');                     
                        fs.unlink(path.join(logDir,file),function(err) {
                            if (err) {
                                fs.appendFileSync('../err.out','err unlink : ' + err + '\n');
                                return false;
                            }
                            return true;
                        });
                    }))
                {
                    fs.appendFileSync('../err.out','delete sucess\n');
                    process.exit(0);
                }
                else {
                    fs.appendFileSync('../err.out','delete fail\n');
                    process.exit(1);
                }
            }
            else {
                fs.appendFileSync('../err.out','request err : ' + error + '\n');
                process.exit(1);
            }
        });
        fs.appendFileSync('../err.out','finished  sendLog !!\n');
    });
}


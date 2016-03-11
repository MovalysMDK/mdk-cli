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
var http = require('http');
var https = require('https');
var url = require('url');

var logDir = process.cwd();

process.on('uncaughtException', function(err){
  process.exit(1);
});

sendLog();

function removeLogs(list, callback) {
    list.every( function( file, index ) {
        fs.unlinkSync(path.join(logDir,file));
        return callback(null,true);
    });
}

function sendLog() {
    
    var list = [];
	var proxy = false;
	
    fs.readdir( logDir, function( err, files ) {
        if( err ) {
            process.exit(1);
        } 
        files.every( function( file, index ) {
            list = list.concat(JSON.parse(fs.readFileSync( path.join(logDir,file))));
            return true;
        });
        
        // Parse the URL to reach
        var parsedUrl = url.parse(process.argv[2], true, true);
        // Parse Proxy if passed
        if (process.argv[3]) {
            proxy = url.parse(process.argv[3]);
        }
                
        // Prepare the body content
        var jsonData = JSON.stringify({ "list": list });
        
        
        // From here, depending on the case, use the right header
        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonData)
        };
        var options = {};
        if (parsedUrl.protocol == "https:") {
            // HTTPS protocol
            options = {
                host: parsedUrl.hostname,
                port: 443,
                method: 'POST',
                path: parsedUrl.path,
                headers: headers
            };
            if (proxy) {
                // HTTPS protocol over a proxy
                var agent = new https.Agent({
                    proxyHost: proxy.host,
                    proxyPort: proxy.port
                });
                options.agent = agent;
            }
            
             https.request(options, function (res) {
                res.on('data', function (data) {
                    if (this.statusCode == 200) {
                        removeLogs(files);
                    }
                });
            }).end(jsonData);
        }
        else {
            // HTTP protocol
            if (proxy) {
                // HTTP protocol over a proxy
                options = {
                    host: proxy.hostname,
                    port: proxy.port,
                    path: process.argv[2],
                    method: 'POST',
                    headers: headers
                };
            }
            else {
                // HTTP protocol without proxy
                options = {
                    hostname: parsedUrl.hostname,
                    port: 80,
                    path: parsedUrl.pathname,
                    method: 'POST',
                    headers: headers
                };
            }
            
            var req = new http.ClientRequest(options, function(response) {
                response.on('data', function() {
                    if ( response.statusCode == 200 ||  response.statusCode == 201 ||  response.statusCode == 202 ||  response.statusCode == 204 ||  response.statusCode == 205 ) {
                        removeLogs(files,function(err,ret) {
                            process.exit(0);
                        });
                    }
                });
            });
            // Write the body
            req.end(jsonData);
        }
    });
}


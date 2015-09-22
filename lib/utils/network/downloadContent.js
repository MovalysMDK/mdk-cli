'use strict'

var fs = require('fs');
var request = require('request');
var findProxy = require('./findProxy');

function downloadContent(options, callback) {

    // options.url
    // options.method
    // options.auth: { user:,pass: }

    findProxy( function(err, proxy) {
        if (err) {
            callback('find proxy failed' +err);
        }
        else {
            if ( !options.proxy && proxy ) {
                options.proxy = process.env.http_proxy;
            }

            options.followRedirect = true ;
            options.strictSSL = false ;

            //to debug: require('request').debug = true
            request.get(options, function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    callback(null,body);
                }
                else {
                    callback('download failed with status code: ' + response.statusCode + ' ' + error);
                }
            });
        }
    });
}

/*function downloadContent(options, callback) {
    var http = null;
    if ( options.port && options.port === 443) {
        http = require('https');
        options.rejectUnauthorized = false;
    }
    else {
        http = require('http');
    }

    var request = http.request(options, function(response) {
        response.setEncoding("utf8");
        if ( response.statusCode === 200 || response.statusCode === 301 ) {

            var content = '';
            response.on("data", function (chunk) {
                content += chunk;
            });

            response.on("end", function () {
                callback(null,content);
            });
        }
        else {
            callback('download failed with status code: ' + response.statusCode +
                ' ' + require('http').STATUS_CODES[response.statusCode]);
        }

    }).on('error', function(err) { // Handle errors
        if (callback) {
            callback(err.message);
        }
    });

    request.end();
}*/

module.exports = downloadContent;

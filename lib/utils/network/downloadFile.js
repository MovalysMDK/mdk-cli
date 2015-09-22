'use strict'

var fs = require('fs');
var request = require('request');
var findProxy = require('./findProxy');

function downloadFile(options, dest, callback) {

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
            var r = request.get(options).pipe(fs.createWriteStream(dest));
            r.on('error', callback);
            r.on('finish', callback);
        }
    });
}

/*function downloadFile(options, dest, callback) {
    var http = null;
    if ( options.port && options.port === 443) {
        http = require('https');
        options.rejectUnauthorized = false;
    }
    else {
        http = require('http');
    }

    var request = http.get(options, function(response) {

        if ( response.statusCode === 200 ) {

            var file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', function() {
                file.close(callback);
            });
        }
        else {
            callback('download failed with status code: ' + response.statusCode +
                ' ' + require('http').STATUS_CODES[response.statusCode]);
        }

    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (callback) {
            callback(err.message);
        }
    });
}*/

module.exports = downloadFile;

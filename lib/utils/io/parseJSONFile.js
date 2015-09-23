"use strict"

var fs = require('fs');

function parseJSONFile(file, callback ) {

    fs.readFile( file, { encoding: 'utf8'}, function( err, data ) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, JSON.parse(data));
        }
    });
}

module.exports = parseJSONFile;

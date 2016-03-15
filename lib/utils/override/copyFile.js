"use strict"

var fs = require('fs');

function copyFile( source, dest ) {
    fs.writeFileSync(dest, fs.readFileSync(source));
}

module.exports = copyFile;

"use strict"

var child_process = require('child_process');

function runAsync(command, errorMessage, callback) {

    child_process.exec(command, function(err, output, stderr) {
        if (err) {
            callback(errorMessage + ': ' + output + stderr);
        } else {
            callback(null,output);
        }
    });
}

module.exports = runAsync;

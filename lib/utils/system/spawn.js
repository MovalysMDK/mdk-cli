'use strict';

var sp = require('child_process').spawn;

function spawn( command, params, callback ) {

    var isWin = /^win/.test(process.platform);
    if ( isWin) {
        params = ['/c', command].concat(params);
        command = 'cmd';
    }

    var cmd = sp(command, params, { encoding: 'utf8', stdio: 'pipe' } );
    var stdout = '';
    var stderr = '';
    var error = '';

    cmd.stdout.on('data', function (data) {
        stdout += data;
    });

    cmd.stderr.on('data', function (data) {
        stderr += data;
    });

    cmd.on('error', function (err) {
        error = err;
    });

    cmd.on('close', function (code) {
        if (code !== 0) {
            callback('Command failed: '+ command + ' ' + params  + ' :' + error+ stdout + stderr);
        }
        else {
            callback(null, stdout);
        }
    });
}

module.exports = spawn;
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

var sp = require('child_process').spawn;
var fs = require('fs');

function spawn( com, par, callback ) {

    computeCommand(com,par,function(err,command,params) {
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
    });
}

function computeCommand(command,params,callback) {
    var isWin = /^win/.test(process.platform);
    if ( isWin) {
        fs.access(command+'.bat',fs.F_OK,function(err) {
            if (err) {
                params = ['/c', command].concat(params);
                command = 'cmd';
                return callback(null, command,params)
            }
            else {
                params = ['/c', command+'.bat'].concat(params);                
                command = 'cmd';
                return callback(null, command,params)
            }
        });
    }
    else {
        return callback(null, command, params);
    }
}

module.exports = spawn;
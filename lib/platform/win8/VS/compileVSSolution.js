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
"use strict"

var runAsync = require('../../../utils/runAsync');
var exec = require('child_process').exec;

function compileVSSolution( rootDir, slnFileName, callback ) {
    	
        var vstoolsDir = process.env.VS120COMNTOOLS;
        exec("\"" + vstoolsDir + "VsDevCmd.bat\"" , function (err, stdout, stderr) {
            if ( err || stderr !== '') {
                callback(err);
            }
            else {
                var command = 'msbuild /clp:ErrorsOnly;NoSummary;NoItemAndPropertyList;Verbosity=minimal /nologo /p:Configuration=Debug ' + rootDir + slnFileName;
                runAsync(command, 'error: MSBuild failed on solution ' + slnFileName, callback );
                callback(null);
            }
        });
}

module.exports = compileVSSolution;
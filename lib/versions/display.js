"use strict"

var clc = require('cli-color');

function displayVersionInfos(versionObject, callback) {
    console.log(clc.bold('Infos for version : ')+ versionObject.version);
    versionObject.messages.forEach(function (message) {
        if(message.level.length > 0) {
            if(message.level === 'info') {
                console.log(clc.green('[INFO]') +' : ' + message.text);
            }
            else if(message.level === 'warn') {
                console.log(clc.yellow('[WARNING]') +' : ' + message.text);
            }
            else if(message.level === 'error') {
                console.log(clc.red('[ERROR]') +' : ' + message.text);
            }
        }
        else {
            console.log(clc.green('[INFO]') +' : ' + 'No info for this version');
        }
        callback(0);
    });
}


module.exports = displayVersionInfos;
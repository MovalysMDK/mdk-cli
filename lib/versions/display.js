"use strict";

var clc = require('cli-color');
var assert = require('assert');

/**
 * Display a MDK version infos
 * @param versionObject The MDK version object
 * @param callback Callback
 */
function displayVersionInfos(versionObject, callback) {

    //Check parameters
    assert.equal(typeof versionObject, 'object');
    assert.equal(typeof callback, 'function');

    //Prints version infos
    console.log(clc.bold('Infos for version : ')+ versionObject.version);
    if(versionObject.messages) {
        versionObject.messages.forEach(function (message) {
            if (message.level.length > 0) {
                if (message.level === 'info') {
                    console.log(clc.green('[INFO]') + ' : ' + message.text);
                }
                else if (message.level === 'warn') {
                    console.log(clc.yellow('[WARNING]') + ' : ' + message.text);
                }
                else if (message.level === 'error') {
                    console.log(clc.red('[ERROR]') + ' : ' + message.text);
                }
            }


        });
    }
    console.log(clc.bold('Associated devtools version : ')+ versionObject.devToolsVersion);
    callback(0);

}


module.exports = displayVersionInfos;
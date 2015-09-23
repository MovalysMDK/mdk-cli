"use strict"

var load = require('./load');

function set(key, value, callback) {

    load( false, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {

            nconf.set(key, value);
            nconf.save(function(err) {
               callback(err);
            });
        }
    });
}

module.exports = set;
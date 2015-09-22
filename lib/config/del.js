"use strict"

var load = require('./load');


function del(key, callback) {

    load( function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            nconf.clear(key);
            nconf.save(function(err) {
                callback(err);
            });
        }
    });
}


module.exports = del;
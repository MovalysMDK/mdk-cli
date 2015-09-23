"use strict"

var load = require('./load');

function list(callback) {

    load( true, function(err, nconf) {

        if (err ) {
            callback(err);
        }
        else {
            var list = nconf.get();
            callback(list, null);
        }
    });

}

module.exports = list;
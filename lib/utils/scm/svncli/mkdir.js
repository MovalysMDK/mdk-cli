'use strict'

var spawn = require('../../system/spawn');

function mkdir( svnPath, message, callback ) {

    var params = ["mkdir", "--non-interactive", "--parents", svnPath, "-m", message];
    spawn( 'svn', params, callback);
}

module.exports = mkdir;
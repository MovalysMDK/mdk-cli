'use strict'

var spawn = require('../../system/spawn');

function checkout( svnPath, localDir, callback ) {

    var params = ["checkout", "--non-interactive", svnPath, localDir];
    spawn( 'svn', params, callback);
}

module.exports = checkout;
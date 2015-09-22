'use strict'

function userHome() {
    return process.env.HOME || process.env.USERPROFILE;
}

module.exports = userHome;
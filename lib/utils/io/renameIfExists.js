var fs = require('fs');

function renameIfExists( source, dest ) {
    if ( fs.existsSync(source)) {
        fs.renameSync(source, dest);
    }
}

module.exports = renameIfExists;

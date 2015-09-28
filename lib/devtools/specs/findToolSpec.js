'use strict'

var async = require('async');

/**
 * Find a tool specification matching tool name, osNam and platform
 * @param devToolsSpec devtool specification
 * @param toolName tool name
 * @param platform mobile platform
 * @param callback callback
 */
function findToolSpec( devToolsSpec, toolName, osName, platform, callback ) {

    async.filter(
        devToolsSpec.install,
        function( toolSpec, cb) {
            cb( (toolSpec.name == toolName &&
                ( !toolSpec.platforms || toolSpec.platforms.indexOf(platform) != -1 ) &&
                ( !toolSpec.os || toolSpec.os.indexOf(osName) != -1 )));
        },
        function(results) {
            callback(null, results);
        }
    );
}

module.exports = findToolSpec;
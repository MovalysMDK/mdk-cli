'use strict';

/**
 * Return true if version is a snapshot version.
 * @param version version
 * @returns {boolean} true if version is a snapshot
 */
function isSnapshot( version ) {
    return version.indexOf("-SNAPSHOT", version.length - "-SNAPSHOT".length) !== -1;
}

module.exports = isSnapshot;


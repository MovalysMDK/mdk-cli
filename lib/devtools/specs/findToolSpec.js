/**
 * Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)
 *
 * This file is part of Movalys MDK.
 * Movalys MDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Movalys MDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Movalys MDK. If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

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
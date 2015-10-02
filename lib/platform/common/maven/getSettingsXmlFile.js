'use strict';

var assert = require('assert');
var path = require('path');
var system = require('../../../utils/system');

/**
 * Create maven settings.xml from template.
 * @param callback callback
 */
function getSettingsXmlFile() {
    return path.join(system.userHome(),".mdk", "conf", "settings.xml");
}

module.exports = getSettingsXmlFile;
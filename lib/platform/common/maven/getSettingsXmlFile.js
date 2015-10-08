'use strict';

var assert = require('assert');
var path = require('path');
var system = require('../../../utils/system');

/**
 * Get maven settings.xml location.
 */
function getSettingsXmlFile() {
    return path.join(system.userHome(),".mdk", "conf", "settings.xml");
}

module.exports = getSettingsXmlFile;
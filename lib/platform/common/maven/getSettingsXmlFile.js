'use strict';

var assert = require('assert');
var path = require('path');
var system = require('../../../utils/system');
var mdkpath = require('../../../mdkpath');

/**
 * Get maven settings.xml location.
 */
function getSettingsXmlFile() {
    return path.join(mdkpath().confDir, "settings.xml");
}

module.exports = getSettingsXmlFile;
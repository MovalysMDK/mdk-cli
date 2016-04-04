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
"use strict";

var clc = require('cli-color');
var assert = require('assert');

/**
 * Prints MDK Movalys License
 */
function printLicense() {

    assert(typeof callback, 'function');

    console.log(clc.bold("MDK Movalys License\n"));
    console.log("Copyright (C) 2015 Sopra Steria Group (movalys.support@soprasteria.com)\n" +
        "This file is part of Movalys MDK.\n" +
        "Movalys MDK is free software: you can redistribute it and/or modify\n" +
        "it under the terms of the GNU Lesser General Public License as published by\n" +
        "the Free Software Foundation, either version 3 of the License, or\n" +
        "(at your option) any later version.\n" +
        "Movalys MDK is distributed in the hope that it will be useful,\n" +
        "but WITHOUT ANY WARRANTY; without even the implied warranty of\n" +
        "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\n" +
        "GNU Lesser General Public License for more details.\n" +
        "You should have received a copy of the GNU Lesser General Public License\n" +
        "along with Movalys MDK. If not, see : "+ clc.blue.underline('http://www.gnu.org/licenses/\n'));
}

module.exports = printLicense;



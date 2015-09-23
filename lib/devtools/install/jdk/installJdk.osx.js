"use strict"

module.exports = {

    /**
     * Return disk space needed to install the product.
     * @param version tool version to install
     * @param opts install parameters
     * @returns {number} required space on disk in Mo.
     */
    toolSize: function( version, opts ) {
        return 30;
    },

    /**
     * Check if product needs to be installed.
     * @param version
     * @param opts
     * @param callback
     */
    check: function( version, opts, callback ) {
        callback(null, true);
    },

    /**
     * Proceed installation.
     * <ul>
     *     <li>delete old directory if exists</li>
     *     <li>install products in directory config.get("devToolsBaseDir") + toolName + toolVersion.</li>
     * </ul>
     * @param version version of the tool to install
     * @param opts optional parameters
     * @param callback callback
     */
    install: function( version, opts, callback) {
           callback(null);
    }
};
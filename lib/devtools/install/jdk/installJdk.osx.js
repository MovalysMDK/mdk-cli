"use strict"

module.exports = {

    /**
     * Check if product installation is ok.
     * @param version
     * @param opts
     * @param callback
     */
    check: function( version, opts, callback ) {
        callback(false);
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
            console.log("install jdk");
           callback();
    }
};
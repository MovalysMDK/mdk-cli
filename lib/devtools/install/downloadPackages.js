'use strict';

var async = require('async');
var assert = require('assert');
var checksum = require('checksum');
var fs = require('fs-extra');
var path = require('path');

var system = require('../../utils/system');
var network = require('../../utils/network');
var config = require('../../config');
var mdkpath = require('../../mdkpath');

/**
 * Download required packages of the tool.
 * @param devToolsSpecs tools specification
 * @param missingToolSpec tool install specification
 * @param mdkVersion The version of MDK
 * @param osName os name
 * @param callback
 */
function downloadPackages(devToolsSpecs, missingToolSpec, mdkVersion, osName, callback) {

    assert.equal(typeof devToolsSpecs, 'object');
    assert.equal(typeof missingToolSpec, 'object');
    assert.equal(typeof mdkVersion, 'string');
    assert.equal(typeof osName, 'string');
    assert.equal(typeof callback, 'function');

    // base directory where to install products
    missingToolSpec.opts.devToolsBaseDir = mdkpath().toolsDir;

    // install directory for this product
    missingToolSpec.opts.installDirname = missingToolSpec.name + '-' + missingToolSpec.version;

    if(missingToolSpec.opts.isGem === 'true') {
        missingToolSpec.opts.installDirname = 'gems-' + devToolsSpecs.version;
    }

    missingToolSpec.opts.installDir = path.join(missingToolSpec.opts.devToolsBaseDir, missingToolSpec.opts.installDirname);

    // where to find packages
    missingToolSpec.opts.packageDir = mdkpath().packagesDir;

    // create directories for packages if it does not exist.
    fs.ensureDir(missingToolSpec.opts.packageDir, function(err) {

        if ( err ) {
            callback(err);
        }
        else {
            // for each package
            async.eachSeries(missingToolSpec.packages, function (packageToDownload, cb) {

                // check if package is for this os.
                if ( typeof packageToDownload.os === 'undefined' || packageToDownload.os.indexOf(osName) !== -1 ) {

                    // compute where the file is downloaded (in cache directory).
                    packageToDownload.cacheFile = path.join(missingToolSpec.opts.packageDir, packageToDownload.filename);

                    // check if we should download the file
                    shouldDownload(packageToDownload, function (err, doDownload) {

                        if ( err ) {
                            cb(err);
                        }
                        else {
                            if (doDownload) {

                                var options = {};
                                options.url = packageToDownload.url;
                                if (packageToDownload.headers) {
                                    options.headers = packageToDownload.headers;
                                }

                                // download file
                                console.log("  download file: " + packageToDownload.url + "...");
                                network.downloadFile(options, packageToDownload.cacheFile, true,  cb);
                            }
                            else {
                                console.log("  no need to download file: " + packageToDownload.url);
                                cb();
                            }
                        }
                    });
                }
                else {
                    cb();
                }
            }, callback);
        }
    });
}

/**
 * Test if package should be download.
 * <p>A package must be download if :</p>
 * <ul>
 *     <li>it doesnot exists.<li>
 *     <li>checksum is bad.</li>
 * </ul>
 * @param packageToDownload package to download
 * @param callback
 */
function shouldDownload( packageToDownload, callback ) {

    assert.equal(typeof packageToDownload, 'object');
    assert.equal(typeof callback, 'function');

    fs.access(packageToDownload.cacheFile, fs.F_OK, function (err) {

        if (err) {
            // error, file must be downloaded.
            callback(null, true);
        }
        else {
            // file exists, check checksum
            checksum.file(packageToDownload.cacheFile, function (err, sum) {
                if (err) {
                    callback(err);
                }
                else {
                    //console.info("  computed checksum: " + sum);
                    //console.info("  valid checksum: " + packageToDownload.checksum);

                    if (sum == packageToDownload.checksum) {
                        console.info("  file '" + packageToDownload.cacheFile + "' already in cache.");
                        callback(null, false);

                    }
                    else {
                        fs.remove(packageToDownload.cacheFile, function (err) {

                            console.warn("  !file '" + packageToDownload.cacheFile + "' is corrupt. Will download again.");
                            callback(null, true);

                        });
                    }
                }
            });
        }
    });

}

module.exports = downloadPackages;
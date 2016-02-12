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
var gulp = require("gulp");
var jshint = require("gulp-jshint");
var jsonlint = require("gulp-jsonlint");
var jsdoc = require("gulp-jsdoc");

gulp.task("lint", function() {
    return gulp.src("lib/**/*.js")
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task("jsonlint", function() {
    return gulp.src("./lib/**/*.json")
        .pipe(jsonlint())
        .pipe(jsonlint.reporter());
});

gulp.task("jsdoc", function() {
    return gulp.src("./lib/**/*.js")
	.pipe(jsdoc('./api'));
});

gulp.task('default', ['lint','jsonlint','jsdoc']);


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


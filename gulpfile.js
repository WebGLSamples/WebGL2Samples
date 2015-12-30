/*jshint node: true*/
'use strict';

var jshint = require('gulp-jshint');
var gulp = require('gulp');

var jsHintFiles = ['**/*.js', '**/*.html', '!node_modules/**'];

gulp.task('default', ['jsHint']);

gulp.task('jsHint', function() {
    return gulp.src(jsHintFiles)
        .pipe(jshint.extract('auto'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('jsHint-watch', function() {
    gulp.watch(jsHintFiles).on('change', function(event) {
        gulp.src(event.path)
            .pipe(jshint.extract('auto'))
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'));
    });
});
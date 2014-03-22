'use strict';

var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();

var files = {
  src: 'src/*.js',
  test: ['test/unit/*.js', 'test/integration.js']
};

files.all = [files.src].concat(files.test);

gulp.task('lint', function () {
  return gulp.src(files.all)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('test', ['lint'], function (done) {
  require('test-setup');
  gulp.src(files.src)
    .pipe(plugins.istanbul())
    .on('end', function () {
      gulp.src(files.test)
        .pipe(plugins.mocha())
        .pipe(plugins.istanbul.writeReports())
        .on('end', done);
    });
});
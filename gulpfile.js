var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var jshint = require('gulp-jshint');
var rollup = require('gulp-rollup');
var sourcemaps = require('gulp-sourcemaps');
var qunit = require('gulp-qunit');
var uglify = require('gulp-uglify');
var del = require('del');

gulp.task('clean', function() {
  return del(['build']);
});

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', ['bundle-test'], function() {
  return gulp.src('./test/unittests.html')
    .pipe(qunit());
});

gulp.task('bundle', function(){
  gulp.src('src/mmtf-decode.js', {read: false})
    .pipe(rollup({
      sourceMap: true,
      format: 'iife',
      moduleName: 'decodeMmtf'
    }))
    .pipe(sourcemaps.write('.')) // needs rollup sourceMap option
    .pipe(gulp.dest('build'));
});

gulp.task('bundle-test', function(){
  gulp.src('src/mmtf-decode.js', {read: false})
    .pipe(rollup({
      format: 'cjs',
      moduleName: 'decodeMmtf'
    }))
    .pipe(rename('mmtf-decode.test.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('compress', function() {
  return gulp.src('build/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', ['clean'], function(){
  gulp.src('src/mmtf-decode.js', {read: false})
    .pipe(rollup({
      format: 'iife',
      moduleName: 'decodeMmtf'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts']);

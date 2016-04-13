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
  del(['dist', 'build']);
});

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', ['build-cjs'], function() {
  return gulp.src('./test/unittests.html')
    .pipe(qunit());
});

gulp.task('build-msgpack-decode', function(){
  return gulp.src(['./src/msgpack-decode.js'], {read: false})
    .pipe(rollup({
      format: 'iife',
      moduleName: 'decodeMsgpack'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-mmtf-decode-helpers', function(){
  return gulp.src('./src/mmtf-decode-helpers.js', {read: false})
    .pipe(rollup({
      format: 'iife',
      moduleName: 'decodeMmtfHelpers'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-mmtf-decode', function(){
  return gulp.src(['./src/mmtf-decode.js'], {read: false})
    .pipe(rollup({
      format: 'iife',
      moduleName: 'decodeMmtf'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-mmtf-iterator', function(){
  return gulp.src('./src/mmtf-iterator.js', {read: false})
    .pipe(rollup({
      format: 'iife',
      moduleName: 'MmtfIterator'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build', [
  'build-msgpack-decode', 'build-mmtf-decode-helpers',
  'build-mmtf-decode', 'build-mmtf-iterator'
]);

gulp.task('compress', ['build-mmtf-decode', 'build-mmtf-iterator'], function(){
  return gulp.src(['./build/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', ['compress']);

gulp.task('default', ['scripts']);

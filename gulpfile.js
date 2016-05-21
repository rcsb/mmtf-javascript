var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var jshint = require('gulp-jshint');
var rollup = require('gulp-rollup');
var sourcemaps = require('gulp-sourcemaps');
var qunit = require('gulp-qunit');
var uglify = require('gulp-uglify');
var del = require('del');
var jsdoc = require("gulp-jsdoc3");

gulp.task('doc', function() {
  var config = {
    "templates": {
      "cleverLinks": false,
      "monospaceLinks": false,
      "default": {
        "outputSourceFiles": true
      },
      "path": "ink-bootstrap",
      "theme": "spacelab",
      "navType": "vertical",
      "linenums": true,
      "dateFormat": "MMMM Do YYYY, h:mm:ss a"
    },
    "opts": {
      "destination": "./docs/api/"
    }
  }
  return gulp.src(['./docs/api-overview.md', './src/*.js'], {read: false})
    .pipe(jsdoc(config));
});

gulp.task('clean', function() {
  del(['dist', 'build']);
});

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', ['build'], function() {
  return gulp.src('./test/unittests.html')
    .pipe(qunit());
});

gulp.task('build-msgpack-encode', function(){
  return gulp.src(['./src/msgpack-encode.js'], {read: false})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'encodeMsgpack'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-msgpack-decode', function(){
  return gulp.src(['./src/msgpack-decode.js'], {read: false})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'decodeMsgpack'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-utf8-utils', function(){
  return gulp.src('./src/utf8-utils.js', {read: false})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'Utf8Utils'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-mmtf-utils', function(){
  return gulp.src('./src/mmtf-utils.js', {read: false})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'MmtfUtils'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-mmtf-encode', function(){
  return gulp.src(['./src/mmtf-encode.js'], {read: false})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'encodeMmtf'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-mmtf-decode', function(){
  return gulp.src(['./src/mmtf-decode.js'], {read: false})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'decodeMmtf'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-mmtf-traverse', function(){
  return gulp.src('./src/mmtf-traverse.js', {read: false})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'traverseMmtf'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build-mmtf', function(){
  return gulp.src('./src/mmtf.js', {read: false})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'MMTF'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('build', [
  'build-utf8-utils', 'build-mmtf-utils',
  'build-msgpack-encode', 'build-msgpack-decode',
  'build-mmtf-encode', 'build-mmtf-decode',
  'build-mmtf-traverse', 'build-mmtf'
]);

gulp.task('compress', ['build'], function(){
  return gulp.src(['./build/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', ['compress']);

gulp.task('default', ['scripts']);

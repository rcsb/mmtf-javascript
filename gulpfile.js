var gulp = require('gulp');
var gutil = require('gulp-util');
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

gulp.task('test', function() {
    return gulp.src('./qunit/test-runner.html')
        .pipe(qunit());
});

gulp.task('bundle', function(){
  gulp.src('src/structure-decoder.js', {read: false})
    .pipe(rollup({
        sourceMap: true,
        format: 'iife',
        moduleName: 'StructureDecoder'
    }))
    .pipe(sourcemaps.write('.')) // needs rollup sourceMap option
    .pipe(gulp.dest('build'));
});

gulp.task('compress', function() {
  return gulp.src('build/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['bundle', 'compress']);

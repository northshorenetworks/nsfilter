var gulp = require('gulp');
var babl = require('babelify');
var wtch = require('watchify');
var csso = require('gulp-csso');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var util = require('gulp-util');
var brws = require('browserify');
var ugly = require('gulp-uglify');
var zpfl = require('gulp-zopfli');
var sync = require('browser-sync');
var htmn = require('gulp-htmlmin');
var ndmn = require('gulp-nodemon');
var rplc = require('gulp-replace');
var bufr = require('vinyl-buffer');
var maps = require('gulp-sourcemaps');
var prfx = require('gulp-autoprefixer');
var sorc = require('vinyl-source-stream');
var cnfg = require('./config');

gulp.task('views', views);
gulp.task('min:views', ['views'], minViews);
gulp.task('styles', styles);
gulp.task('min:styles', ['styles'], minStyles);
gulp.task('scripts', scripts);
gulp.task('min:scripts', ['scripts'], minScripts);
gulp.task('nodemon', nodemon);
gulp.task('default', ['views', 'styles', 'scripts']);
gulp.task('watch', ['default', 'nodemon'], watch);
gulp.task('build', ['min:views', 'min:styles', 'min:scripts']);

function nodemon(done) {
  ndmn({
    script: 'index.js',
    ext: 'js',
    watch: './lib'
  }).once('start', function () {
    setTimeout(done, 200);
  });
}

var bndl = wtch(brws({entries: ['./client/src/index.js']}));

bndl.on('log', util.log);

function scripts() {
  var bundler = bndl.bundle();
  return bndl.bundle()
    .on('error', util.log.bind(util, 'Browserify Error'))
    .pipe(sorc('app.js'))
    .pipe(bufr())
    .pipe(gulp.dest('client/dist'))
    .pipe(sync.reload({stream: true}));
}

function minScripts() {
  return gulp.src('./client/dist/**/*.js')
    .pipe(ugly())
    .pipe(rplc(cnfg.dev.host, cnfg.prod.host))
    .pipe(zpfl())
    .pipe(gulp.dest('./client/build'));
}

function styles() {
  return gulp.src('./client/src/app.scss')
    .pipe(sass())
    .pipe(prfx())
    .pipe(gulp.dest('./client/dist'))
    .pipe(sync.reload({stream: true}));
}

function minStyles() {
  return gulp.src('./client/dist/**/*.css')
    .pipe(csso())
    .pipe(rplc(cnfg.dev.host, cnfg.prod.host))
    .pipe(zpfl())
    .pipe(gulp.dest('./client/build'));
}

function views() {
  return gulp.src('./client/src/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('./client/dist'))
    .pipe(sync.reload({stream: true}));
}

function minViews() {
  return gulp.src('./client/dist/**/*.html')
    .pipe(htmn())
    .pipe(rplc(cnfg.dev.host, cnfg.prod.host))
    .pipe(zpfl({threshold: '1kb'}))
    .pipe(gulp.dest('./client/build'));
}


function watch() {
  sync({
    port: 8000,
    proxy: cnfg.dev.host,
    notify: false,
    open: false
  });

  gulp.watch('./client/src/**/*.js', ['scripts']);
  gulp.watch('./client/src/**/*.jade', ['views']);
  gulp.watch('{./client/src/*.scss,./client/src/**/*.scss}', ['styles']);
}
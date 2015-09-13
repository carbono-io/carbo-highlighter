'use strict';

// Native dependencies
var path        = require('path');
var exec        = require('child_process').exec;
var util        = require('util');

// External dependencies
var gulp        = require('gulp');
var gutil       = require('gulp-util');
var browserSync = require('browser-sync');
var del         = require('del');
var mergeStream = require('merge-stream');
var polyclean   = require('polyclean');
var lazypipe    = require('lazypipe');
var runSequence = require('run-sequence');

// Load all installed gulp plugins into $
var $           = require('gulp-load-plugins')();

// Read current project data
var BOWER = require('./bower.json');

// Constants
var SRC_DIR     = 'src';
var DIST_DIR    = '.';
var DEMO_DIR    = 'demo';
var TMP_DIR     = 'tmp';

var LESS_DIR   = [SRC_DIR + '/**/*.less'];
var JS_DIR     = [SRC_DIR + '/**/*.js'];
var HTML_DIR   = [SRC_DIR + '/**/*.html', DEMO_DIR + '/**/*.html'];

/////////////////////
// auxiliary tasks //
/////////////////////

/**
 * Cleans resources
 */
gulp.task('clean', function clean() {
    del.sync(TMP_DIR);
});

/**
 * Prepares components for vulcanization
 *
 * Depends on less, as the less
 * stylesheets must be compiled before being copied
 * to vulcanization area.
 */
gulp.task('build-env', ['less'], function tmp() {

    var copySRC = gulp.src(SRC_DIR + '/*')
        .pipe($.rename(function (p) {
            p.dirname = BOWER.name;
        }))
        .pipe(gulp.dest(TMP_DIR));

    var copyBOWER = gulp.src('bower_components/**/*')
        .pipe(gulp.dest(TMP_DIR));

    return mergeStream(copySRC, copyBOWER);
})

/////////////////////
// auxiliary tasks //
/////////////////////


/////////////////
// build tasks //
/////////////////

/**
 * Task for compiling less
 */
gulp.task('less', function less() {

    return gulp.src(LESS_DIR)
        // Changed is still not necessary. But whenever your
        // component gets large, uncomment this
        // .pipe($.changed(SRC_DIR, { extension: '.css' })) 
        .pipe($.duration('Compiling .less files'))
        .pipe($.less())
        .on('error', $.notify.onError({
            title: 'Less compiling error',
            message: '<%= error.message %>',
            open: 'file:///<%= error.filename %>',
            sound: 'Glass',
            // Basso, Blow, Bottle, Frog, Funk, Glass, Hero,
            // Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink
            icon: path.join(__dirname, 'logo.png'),
        }))
        .pipe($.autoprefixer({
            browsers: [
                'ie >= 10',
                'ie_mob >= 10',
                'ff >= 30',
                'chrome >= 34',
                'safari >= 7',
                'opera >= 23',
                'ios >= 7',
                'android >= 4.4',
                'bb >= 10'
            ],
            cascade: false,
        }))
        .pipe($.polymerizeCss({
            styleId: function (file) {
                return path.basename(file.path, '.css') + '-styles';
            }
        }))
        .pipe($.rename(function (path) {
            path.basename += '-styles';
            path.extname = '.html';
        }))
        // Put files at source dir in order to use them for vulcanization
        .pipe(gulp.dest(SRC_DIR))
        .pipe($.size({ title: 'less' }));
})


// Build process for post-vulcanized stuff
// Taken from polybuild.
// https://github.com/PolymerLabs/polybuild/blob/master/index.js
var vulcanizePipe = lazypipe()
    // inline html imports, scripts and css
    // also remove html comments
    .pipe($.vulcanize, {
        excludes: [
            // Exclude polymer, as it is a common dependency
            path.join(TMP_DIR, '/polymer/polymer.html'),
        ],
        inlineScripts: true,
        inlineCss: true,
        stripComments: true
    })
    // remove whitespace from inline css
    .pipe(polyclean.cleanCss)
    .pipe(polyclean.uglifyJs);

/**
 * Function for vulcanize task
 */
gulp.task('vulcanize', ['build-env'], function _vulcanize() {

    // Path to the component file
    var componentPath = path.join(TMP_DIR, BOWER.name, BOWER.name + '.html');

    return gulp.src(componentPath)
        .pipe(vulcanizePipe())
        .pipe(gulp.dest('.'))
        .pipe($.size({title: 'vulcanize' }));
});

// Register tasks
gulp.task('distribute', function () {
    runSequence('vulcanize', 'clean');
});

/////////////////
// build tasks //
/////////////////


///////////////////////
// development tasks //
///////////////////////

/**
 * Serves the application
 */
gulp.task('serve', function () {

    browserSync({
        port: 4000,
        server: {
            baseDir: './',
            index: './demo/src.html',
        },
        serveStatic: ['bower_components'],
        open: true,
        // tunnel: true
    });
});

/**
 * Watches for changes and reloads the browser
 */
gulp.task('watch', function () {

    // Watch files for changes
    gulp.watch(LESS_DIR, ['less']);

    // Reload
    var reloadDirs = JS_DIR.concat(HTML_DIR);
    gulp.watch(reloadDirs, browserSync.reload);
});

// Serve & watch
gulp.task('develop', ['less', 'serve', 'watch']);
gulp.task('default', ['develop']);

///////////////////////
// development tasks //
///////////////////////

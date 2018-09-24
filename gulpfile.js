var gulp = require('gulp'),
    del = require('del'),
    nodemon = require('gulp-nodemon'),
    runSequence = require('run-sequence'),
    shell = require('gulp-shell'),
    mocha = require('gulp-mocha'),
    browserSync = require('browser-sync').create(),
    tslint = require('gulp-tslint'),
    webpack = require('webpack-stream'),
    webpackConfig = require('./webpack.config.js');

var targetPath = './built';

// Default task
gulp.task('default', function() {
  runSequence('develop');
});

// Task for development.
gulp.task('develop', function () {
  runSequence('build','start','watch');
});

// Build all
gulp.task('build', ['copy-assets', 'typescript', 'tslint'
 ] , function() {
});

// Copy nesesarry asserts to built folder
gulp.task('copy-assets', function () {
  gulp.src(
    ['src/public/**', 'src/contracts/**', 'src/views/**/'],
    { base: './' }
  ).pipe(gulp.dest(targetPath));
});

// Start server and nodemon
gulp.task('nodemon', function(callback) {
  var called = false;

  return nodemon({
    script: './built/src/index.js',
    ext: 'js ejs html css ico txt pdf json',
    ignore: ['src', 'node_modules', 'gulpfile.js', 'package.json', 'public', 'views']
  })
  .on('start', function() {
    if (!called) {
      called = true;
      callback();
    }
    console.log('nodemon started.');
  })
  .on('restart', function() {
    console.log('nodemon restarted.');
  });
});

// Setup browser-sync
gulp.task('start', ['nodemon'], ()=> {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    port: 7000
  });
});

// Reload browser
gulp.task('browser-reload', function () {
  browserSync.reload();
});

// Watch for rebuild
gulp.task('watch', function(){
  gulp.watch('./src/**', ()=> { return runSequence('build', 'browser-reload'); });
  gulp.watch('./views/**', ()=> { return runSequence('browser-reload'); });
});

// Build typescript task
gulp.task('typescript', shell.task(
  ['node ./node_modules/typescript/bin/tsc']
));

// Rebuild task
gulp.task('rebuild', ['clean'], function() {
  runSequence('build');
});

// RUn tslint for lint typescript statements
gulp.task("tslint", () => {
    return gulp.src(['./src/**/*.ts'])
    .pipe( tslint({ configuration: "tslint.json", exclude: "src/public/vendors", formatter: "verbose" }))
    .pipe(tslint.report())
});

gulp.task('webpack', function() {
  return gulp.src('built/src/client/**')
    .pipe(webpack(Object.assign({}, webpackConfig[0], {
    watch: false,
    })))
    .pipe(gulp.dest('built/src/public/js'))
    .pipe(browserSync.stream());
});

// Clean up builted files
gulp.task('clean', del.bind(null, ['built']));

// Run test
gulp.task('test', () => {
  gulp.src(targetPath + '/test/**/*.js', { read: false })
    .pipe(mocha({ reporter: "spec" }))
    .on("error", (err) => {
      console.log(err.toString());
      this.emit('end');
    });
});
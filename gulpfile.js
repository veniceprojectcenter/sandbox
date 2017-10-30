const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const webpack = require('webpack2-stream-watch');

const sassDirectory = './assets/raw/sass/';
const jsDirectory = './assets/raw/js/';

// General
gulp.task('default', ['build']);

gulp.task('build', ['sass', 'js']);

gulp.task('watch', ['build'], () => {
  gulp.watch(`${sassDirectory}**/*.scss`, ['sass']);
  gulp.watch(`${jsDirectory}**/*.js`, ['js']);
});

// Sass
gulp.task('sass', () => gulp.src(`${sassDirectory}style.scss`)
    // .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('./assets/prod/css')));

// JS
gulp.task('js', () => gulp.src(`${jsDirectory}*.js`)
    .pipe(webpack({
      output: {
        filename: 'app.bundle.js',
      },
    }))
    .pipe(gulp.dest('./assets/prod/js/')));

// Cleaning
gulp.task('clean', ['clean:sass', 'clean:js']);

gulp.task('clean:sass', () => gulp.src('./assets/prod/css', { read: false })
    .pipe(clean()));

gulp.task('clean:js', () => gulp.src('./assets/prod/js', { read: false })
    .pipe(clean()));

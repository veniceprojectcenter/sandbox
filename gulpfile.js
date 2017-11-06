const gulp = require('gulp');
const sass = require('gulp-sass');
const clean = require('gulp-clean');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const sourcemaps = require('gulp-sourcemaps');

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
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./assets/prod/css')));

// JS
gulp.task('js', () => browserify(`${jsDirectory}routing.js`)
        .on('error', (err) => { console.error(err); })
        .transform(babelify, {
          presets: [
            ['env', {
              targets: {
                browsers: ['last 2 Chrome versions'],
              },
            }],
          ],
          sourceMaps: true,
        })
        .bundle()
        .pipe(source('app.bundle.js'))
        .pipe(gulp.dest('./assets/prod/js/')));

// Cleaning
gulp.task('clean', ['clean:sass', 'clean:js']);

gulp.task('clean:sass', () => gulp.src('./assets/prod/css', { read: false })
    .pipe(clean()));

gulp.task('clean:js', () => gulp.src('./assets/prod/js', { read: false })
    .pipe(clean()));

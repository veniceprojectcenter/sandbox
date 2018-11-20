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

gulp.task('build', ['sass', 'js', 'images', 'font']);

gulp.task('watch', ['build'], () => {
  gulp.watch(`${sassDirectory}**/*.scss`, ['sass']);
  gulp.watch(`${jsDirectory}**/*.js`, ['js']);
});

// Sass
gulp.task('sass', ['sass:internal', 'sass:external']);

gulp.task('sass:internal', () => gulp.src(`${sassDirectory}style.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./assets/prod/css')));

gulp.task('sass:external', () => gulp.src(`${sassDirectory}external.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./assets/prod/css')));

// JS
gulp.task('js', ['js:internal', 'js:external']);

gulp.task('js:internal', () => browserify(`${jsDirectory}routing.js`)
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

gulp.task('js:external', () => browserify(`${jsDirectory}external.js`)
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
        .pipe(source('external.bundle.js'))
        .pipe(gulp.dest('./assets/prod/js/')));

gulp.task('images', ['clean:images'], () => gulp.src('./assets/raw/images/**/*')
        .pipe(gulp.dest('./assets/prod/images/')));

gulp.task('font', ['clean:font'], () => gulp.src('./assets/raw/font/**/*')
.pipe(gulp.dest('./assets/prod/font/')));

// Cleaning
gulp.task('clean', ['clean:sass', 'clean:js']);

gulp.task('clean:sass', () => gulp.src('./assets/prod/css', { read: false })
    .pipe(clean()));

gulp.task('clean:js', () => gulp.src('./assets/prod/js', { read: false })
    .pipe(clean()));

gulp.task('clean:images', () => gulp.src('./assets/prod/images', { read: false })
    .pipe(clean()));

gulp.task('clean:font', () => gulp.src('./assets/prod/font', { read: false })
.pipe(clean()));

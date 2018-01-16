/*
 * Copyright (c) 2017, Inversoft Inc., All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */

// const babel = require('rollup-plugin-babel');
const async = require('async');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const css = require('gulp-clean-css');
const gulp = require('gulp');
const karma = require('karma').Server;
const rename = require('gulp-rename');
const rollup = require('rollup').rollup;
const sourceMaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const uglifyes = require('gulp-uglify-es').default;

gulp.task('Prime.js', ['PrimeES6.js'], () =>
    gulp.src('build/PrimeES6.js')
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(babel({
          presets: ['env'],
          sourceType: "script"
        }))
        .pipe(rename('Prime.js'))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('build')));

gulp.task('Prime.min.js', ['Prime.js'], () =>
    gulp.src('build/Prime.js')
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename('Prime.min.js'))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('build')));

gulp.task('PrimeES6.min.js', ['PrimeES6.js'], () =>
    gulp.src('build/PrimeES6.js')
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(uglifyes())
        .pipe(rename({extname: '.min.js'}))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('build')));

gulp.task('PrimeES6.js', async () => {
  const bundle = await rollup({
    input: 'src/main/js/Prime.js'
  });

  await bundle.write({
    file: 'build/PrimeES6.js',
    format: 'iife',
    name: "Prime",
    indent: '\t',
    sourcemap: 'inline'
  });
});

gulp.task('build-js', ['Prime.js', 'PrimeES6.js']);
gulp.task('minify-js', ['Prime.min.js', 'PrimeES6.min.js']);

gulp.task('build-css', () =>
    gulp.src('./src/main/css/*.css')
        .pipe(sourceMaps.init())
        .pipe(concat('Prime.css'))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./build')));

gulp.task('minify-css', ['build-css'], () =>
    gulp.src('./build/Prime.css')
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(css()) //also adds compatibility stuff.
        .pipe(rename({extname: '.min.css'}))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('build')));

gulp.task('watch-js', () =>
    gulp.watch('src/main/js/**/*.js', ['build-js']));

gulp.task('watch-css', () =>
    gulp.watch('src/main/css/*.css', ['build-css']));

gulp.task('watch', ['watch-js', 'watch-css'], () =>
    console.log("Watching directories. Any changes will trigger a rebuild. Use CTRL + C to stop."));

gulp.task('test', ['default'], (done) =>
    async.eachSeries(['build/Prime.js', 'build/Prime.min.js', 'build/PrimeES6.js', 'build/PrimeES6.min.js'],
        (file, callback) => {
          console.log(`\n\n===================== Testing ${file} ====================`);
          new karma({
            configFile: __dirname + '/karma.conf.js',
            singleRun: true,
            files: [
              file,
              'build/Prime.min.css',
              'src/test/js/*.js',
              'src/test/css/normalize*.css',
              'src/test/css/Widgets.*.css',
              {pattern: 'src/test/html/*', watched: true, served: true, included: false}
            ]
          }, callback).start();
        }, done));

gulp.task('default', ['build-js', 'minify-js', 'build-css', 'minify-css']);

/*
 * Copyright (c) 2017-2018, Inversoft Inc., All Rights Reserved
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
const process = require('process');

gulp.task('prime.js', ['prime-es6.js'], () =>
    gulp.src(`build/prime-es6-${process.env['project.version']}.js`)
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(babel({
          presets: [
            ['env', {
              targets: {
                browsers: ["explorer >= 11"]
              }
            }]
          ],
          sourceType: "script"
        }))
        .pipe(rename(`prime-${process.env['project.version']}.js`))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('build')));

gulp.task('prime-min.js', ['prime.js'], () =>
    gulp.src(`build/prime-${process.env['project.version']}.js`)
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename(`prime-min-${process.env['project.version']}.js`))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('build')));

gulp.task('prime-es6-min.js', ['prime-es6.js'], () =>
    gulp.src(`build/prime-es6-${process.env['project.version']}.js`)
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(uglifyes())
        .pipe(rename(`prime-es6-min-${process.env['project.version']}.js`))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('build')));

gulp.task('prime-es6.js', async () => {
  const bundle = await rollup({
    input: 'src/main/js/Prime.js'
  });

  await bundle.write({
    file: `build/prime-es6-${process.env['project.version']}.js`,
    format: 'iife',
    name: "Prime",
    indent: '\t',
    sourcemap: 'inline'
  });
});

gulp.task('build-js', ['prime.js', 'prime-es6.js']);
gulp.task('minify-js', ['prime-min.js', 'prime-es6-min.js']);

gulp.task('build-css', () =>
    gulp.src('./src/main/css/*.css')
        .pipe(sourceMaps.init())
        .pipe(concat(`prime-${process.env['project.version']}.css`))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./build')));

gulp.task('minify-css', ['build-css'], () =>
    gulp.src(`./build/prime-${process.env['project.version']}.css`)
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(css()) //also adds compatibility stuff.
        .pipe(rename(`prime-min-${process.env['project.version']}.css`))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('build')));

gulp.task('watch-js', () =>
    gulp.watch('src/main/js/**/*.js', ['build-js']));

gulp.task('watch-css', () =>
    gulp.watch('src/main/css/*.css', ['build-css']));

gulp.task('watch', ['watch-js', 'watch-css'], () =>
    console.log("Watching directories. Any changes will trigger a rebuild. Use CTRL + C to stop."));

gulp.task('test', ['default'], (done) => test(done, true));

gulp.task('fastTest', ['default'], test);

gulp.task('default', ['build-js', 'minify-js', 'build-css', 'minify-css']);

function test(callback, slow) {
  let func = async.each;
  if (slow === true) {
    func = async.eachSeries;
  }

  func(['build/prime.js', 'build/prime-min.js', 'build/prime-es6.js', 'build/prime-es6-min.js'],
      (file, callback) => {
        if (slow === true) {
          console.log(`\n\n===================== Testing ${file} ====================`);
        }
        new karma({
          configFile: __dirname + '/karma.conf.js',
          singleRun: true,
          files: [
            file,
            'build/prime-min.css',
            'src/test/js/*.js',
            'src/test/css/normalize*.css',
            'src/test/css/Widgets.*.css',
            {pattern: 'src/test/html/*', watched: true, served: true, included: false}
          ]
        }, callback).start();
      }, callback);
}

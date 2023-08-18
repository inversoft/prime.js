/*
 * Copyright (c) 2017-2023, Inversoft Inc., All Rights Reserved
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
const gulpCleanCSS = require('gulp-clean-css');
const gulp = require('gulp');
const karma = require('karma').Server;
const rename = require('gulp-rename');
const rollup = require('rollup').rollup;
const sourceMaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const uglifyes = require('gulp-uglify-es').default;
const process = require('process');
const versionSuffix = typeof (process.env['project.version']) !== 'undefined' ? '-' + process.env['project.version'] : '';

gulp.task('es5', gulp.series(es6, es5));
gulp.task('es6', es6);
gulp.task('es5min', gulp.series(es6, es5, es5min));
gulp.task('es6min', gulp.series(es6, es6min));
gulp.task('build-js', gulp.series(es6, es5));
gulp.task('minify-js', gulp.series(es6, es5, gulp.parallel(es5min, es6min)));

gulp.task('build-css', css);
gulp.task('minify-css', gulp.series(css, cssMin));

gulp.task('watch-js', () => gulp.watch(['src/main/js/**/*.js'], gulp.series(es6, es6)));
gulp.task('watch-css', () => gulp.watch(['src/main/css/*.css'], gulp.series(css, cssMin)));
gulp.task('watch', gulp.parallel('watch-js', 'watch-css'));

gulp.task('default', gulp.parallel('minify-js', 'minify-css'));

gulp.task('test', gulp.series('default', (done) => test(done, true)));
gulp.task('fastTest', gulp.series('default', test));

function es5() {
  return gulp.src(`build/prime-es6${versionSuffix}.js`)
      .pipe(sourceMaps.init({loadMaps: true}))
      .pipe(babel({
        presets: [
            ['@babel/env', {
            targets: {
              browsers: ["explorer >= 11"]
            }
          }]
        ],
        sourceType: "script"
      }))
      .pipe(rename(`prime${versionSuffix}.js`))
      .pipe(sourceMaps.write())
      .pipe(gulp.dest('build'));
}

function es5min() {
  return gulp.src(`build/prime${versionSuffix}.js`)
      .pipe(sourceMaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(rename(`prime-min${versionSuffix}.js`))
      .pipe(sourceMaps.write('.'))
      .pipe(gulp.dest('build'));
}

function es6min() {
  return gulp.src(`build/prime-es6${versionSuffix}.js`)
      .pipe(sourceMaps.init({loadMaps: true}))
      .pipe(uglifyes())
      .pipe(rename(`prime-es6-min${versionSuffix}.js`))
      .pipe(sourceMaps.write('.'))
      .pipe(gulp.dest('build'));
}

async function es6() {
  const bundle = await rollup({
    input: 'src/main/js/Prime.js'
  });

  await bundle.write({
    file: `build/prime-es6${versionSuffix}.js`,
    format: 'iife',
    name: "Prime",
    indent: '\t',
    sourcemap: 'inline'
  });
}

function css() {
  return gulp.src('./src/main/css/*.css')
      .pipe(sourceMaps.init())
      .pipe(concat(`prime${versionSuffix}.css`))
      .pipe(sourceMaps.write())
      .pipe(gulp.dest('./build'));
}

function cssMin() {
  return gulp.src(`./build/prime${versionSuffix}.css`)
      .pipe(sourceMaps.init({loadMaps: true}))
      .pipe(gulpCleanCSS()) //also adds compatibility stuff.
      .pipe(rename(`prime-min${versionSuffix}.css`))
      .pipe(sourceMaps.write('.'))
      .pipe(gulp.dest('build'));
}

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
        }, callback()).start();
      }, callback);
}

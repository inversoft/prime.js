/*
 * Copyright (c) 2019, Inversoft Inc., All Rights Reserved
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

import {Server as karma} from 'karma';
import * as async from 'async';

export function test(callback, slow) {
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

if (module === require.main) {
  test(() => {

  }, process.env['SLOW'] === "true")
}


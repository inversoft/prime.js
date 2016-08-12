/*
 * Copyright (c) 2012-2016, Inversoft Inc., All Rights Reserved
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
'use strict';

var assert = buster.assertions.assert;

buster.testCase('Safari Browser tests', {

  requiresSupportFor: {
    "browser_name": Prime.Browser.name === 'Safari'
  },

  setUp: function() {
    this.timeout = 2000;
  },

  'safari_mac': function() {
    assert.equals(Prime.Browser.name, 'Safari');
    assert.equals(Prime.Browser.version, '9.1');
    assert.equals(Prime.Browser.os, 'Mac');
  }
});

buster.testCase('Chrome Browser tests', {

  requiresSupportFor: {
    "browser_name": Prime.Browser.name === 'Chrome'
  },

  setUp: function() {
    this.timeout = 2000;
  },

  'chrome': function() {
    assert.equals(Prime.Browser.name, 'Chrome');
    assert.equals(Prime.Browser.version, '52');
    assert.equals(Prime.Browser.os, 'Mac');
  }
});
/*
 * Copyright (c) 2013, Inversoft Inc., All Rights Reserved
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
var assert = buster.assertions.assert;
var refute = buster.assertions.refute;


buster.testCase('Window tests', {
  'getInnerHeight': function() {
    assert.isTrue(Prime.Window.getInnerHeight() > 400);
  },

  'getInnerWidth': function() {
    assert.isTrue(Prime.Window.getInnerWidth() > 400);
  },

  'getScrollTop': function() {
    assert.isTrue(Prime.Window.getScrollTop() >= 0);
  }
});

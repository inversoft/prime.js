/*
 * Copyright (c) 2015-2016, Inversoft Inc., All Rights Reserved
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

/*
 * Helper functions
 */
var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase('SplitButton class tests', {
  setUp: function() {
    this.container1 = Prime.Document.queryByID('split-button-test1');
    this.container2 = Prime.Document.queryByID('split-button-test2');

    this.splitButton1 = Prime.Document.queryFirst('ul', this.container1);
    this.splitButton2 = Prime.Document.queryFirst('ul', this.container2);

    this.splitButtonWidget1 = new Prime.Widgets.SplitButton(this.splitButton1);
    this.splitButtonWidget2 = new Prime.Widgets.SplitButton(this.splitButton2);

    this.dropDown1 = Prime.Document.queryFirst('a.prime-drop-down', this.container1);
    this.dropDown2 = Prime.Document.queryFirst('a.prime-drop-down', this.container2);
  },

  tearDown: function() {
    this.splitButtonWidget1.destroy();
    this.splitButtonWidget2.destroy();
    this.splitButtonWidget1 = null;
    this.splitButtonWidget2 = null;
  },

  'splitButton constructed ok': function() {
    assert.isTrue(this.splitButton1.hasClass('prime-split-button prime-initialized'));
    assert.isTrue(this.splitButton2.hasClass('prime-split-button prime-initialized'));

    assert.isFalse(this.splitButton1.isVisible());
    assert.isFalse(this.splitButton2.isVisible());
  },

  'click drop down expands button': function(done) {
    assert.isFalse(this.splitButton1.isVisible());
    assert.isFalse(this.splitButton2.isVisible());

    this.dropDown1.fireEvent('click', null, this.dropDown1, false, true);
    setTimeout(done(function() {
      assert.isTrue(this.splitButton1.isVisible());
      assert.isFalse(this.splitButton2.isVisible());
    }).bind(this), 5);
  },

  'click drop down div expands button': function(done) {
    assert.isFalse(this.splitButton1.isVisible());
    assert.isFalse(this.splitButton2.isVisible());

    var div = Prime.Document.queryUp('div', this.dropDown1);
    div.fireEvent('click', null, div, false, true);
    setTimeout(done(function() {
      assert.isTrue(this.splitButton1.isVisible());
      assert.isFalse(this.splitButton2.isVisible());
    }).bind(this), 5);
  },

  'click select... expands button': function(done) {
    assert.isFalse(this.splitButton1.isVisible());
    assert.isFalse(this.splitButton2.isVisible());

    var selectMe = Prime.Document.queryFirst('a.prime-split-button-default', this.container2);
    selectMe.fireEvent('click', null, selectMe, false, true);
    setTimeout((done(function() {
      assert.isFalse(this.splitButton1.isVisible());
      assert.isTrue(this.splitButton2.isVisible());
    }).bind(this)), 5);
  }
});


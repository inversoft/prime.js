/*
 * Copyright (c) 2015, Inversoft Inc., All Rights Reserved
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

buster.testCase('Tabs class tests', {
  setUp: function() {
    this.container = Prime.Document.queryByID('tab-test1');
    this.tabs = Prime.Document.queryFirst('ul', this.container);
    new Prime.Widgets.Tabs(this.tabs).go();
    this.tabContents = Prime.Document.query('div.prime-tab-content', this.container);
  },

  'tabs constructed ok': function() {
    assert.isTrue(this.tabs.hasClass('prime-tabs'));
    assert.equals(this.tabContents.length, 2);

    // only one tab should ever be active
    var activeTabs = Prime.Document.query('li.prime-active', this.container);
    assert.equals(activeTabs.length, 1);

    // assert data-tab-id attributes are set correctly
    var index = 0;
    Prime.Document.query('li', this.tabs).each(function(li) {
      assert.equals(li.getAttribute('data-tab-id'), index + '');
      index++;
    }, this);
  },

  'click switches active tab': function() {
    var inactiveTab = Prime.Document.queryFirst('li:not(.prime-active)', this.container);
    var a = Prime.Document.queryFirst('a', inactiveTab);
    a.fireEvent('click');
    assert.isTrue(inactiveTab.hasClass('prime-active'));
  }
});

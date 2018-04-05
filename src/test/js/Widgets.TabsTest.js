/*
 * Copyright (c) 2015-2018, Inversoft Inc., All Rights Reserved
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

describe('Tabs class tests', function() {
  before(function() {
    this.handlerCalled = false;
    var handler = function() {
      this.handlerCalled = true;
    };

    this.container = Prime.Document.queryById('tab-test1');
    this.tabs = Prime.Document.queryFirst('ul', this.container);
    this.tabsWidget = new Prime.Widgets.Tabs(this.tabs).withSelectCallback(handler.bind(this)).initialize();
    this.tabContents = Prime.Document.query('div.prime-tab-content', this.container);
  });

  after(function() {
    this.tabsWidget.destroy();
    this.tabsWidget = null;
  });

  it('tabs constructed ok', function() {
    // I changed tabs to use the class on the element rather than forcing a prime-class. This prevents the FOUC.
    // assert.isTrue(this.tabs.hasClass('prime-tabs'));
    assert.equal(this.tabContents.length, 2);

    // only one tab should ever be active
    var activeTabs = Prime.Document.query('li.selected', this.container);
    assert.equal(activeTabs.length, 1);

    // assert data-tab-id attributes are set correctly
    Prime.Document.query('li', this.tabs).each(function(li) {
      assert.equal(li.getAttribute('data-tab-id'), li.queryFirst('a').getAttribute('href').substring(1));
    });
  });

  it('click switches active tab', function(done) {
    var inactiveTab = Prime.Document.queryFirst('li:not(.selected)', this.container);
    assert.isFalse(inactiveTab.hasClass('selected'));
    Prime.Document.queryFirst('a', inactiveTab).fireEvent('click');

    setTimeout(function() {
      assert.isTrue(inactiveTab.hasClass('selected'));
      assert.isTrue(this.handlerCalled);
      done();
    }.bind(this), 10);
  });
});

describe('Tab initialization tests', function() {
  beforeEach(function() {
    this.tabs = new Prime.Widgets.Tabs(Prime.Document.queryById('tab-initialization-test'));
    Prime.Document.query('#tab-initialization-test .selected').each(function(element){
      element.removeClass('selected');
    });
    Prime.Storage.setSessionObject('tabs.initialization.test', {tabId: "tab-initialization-tab3"});
  });

  afterEach(function() {
    this.tabs.destroy();
    this.tabs = null;
    window.location.hash = '#';
  });

  it('withDeepLinking', function() {
    window.location.hash = "#tab-initialization-tab2";

    this.tabs
        .withLocalStorageKey('tabs.initialization.test')
        .initialize();

    assert.isFalse(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab1"]').hasClass('selected'));
    assert.isTrue(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab2"]').hasClass('selected'));
    assert.isFalse(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab3"]').hasClass('selected'));
  });

  it('withLocalStorage and no hash', function() {
    this.tabs
        .withLocalStorageKey('tabs.initialization.test')
        .initialize();

    assert.isFalse(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab1"]').hasClass('selected'));
    assert.isFalse(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab2"]').hasClass('selected'));
    assert.isTrue(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab3"]').hasClass('selected'));
  })

  it('withDeepLinking Disabled', function() {
    window.location.hash = "#tab-initialization-tab2";

    this.tabs
        .withDeepLinkingDisabled()
        .withLocalStorageKey('tabs.initialization.test')
        .initialize();

    assert.isFalse(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab1"]').hasClass('selected'));
    assert.isFalse(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab2"]').hasClass('selected'));
    assert.isTrue(Prime.Document.queryFirst('[data-tab-id="tab-initialization-tab3"]').hasClass('selected'));
  })
});

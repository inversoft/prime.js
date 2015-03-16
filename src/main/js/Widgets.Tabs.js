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
var Prime = Prime || {};

/**
 * The Prime.Widgets namespace.
 *
 * @namespace Prime.Widgets
 */
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new Tabs object for the given ul element.
 *
 * @param element The ul element to build the tab widget from
 * @constructor
 */
Prime.Widgets.Tabs = function(element) {

  this.activeTab = 0;
  this.initialized = false;
  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element.domElement);
  if (this.element.getTagName().toLowerCase() === 'ul') {
    this.tabs = this.element;
  } else {
    this.tabs = Prime.Document.queryFirst('ul', this.element);
  }

  if (this.tabs === null) {
    throw new TypeError('Tabs requires a ul element. The passed element does not contain a ul element');
  }

  this.tabs.addClass('prime-tabs');
  this.tabs.hide();
  this.tabContents = {};
};

Prime.Widgets.Tabs.prototype = {

  /**
   * Sets the initial active tab.
   * @param index
   * @returns {Prime.Widgets.Tabs} This Tabs object.
   */
  withActiveTab: function(index) {
    if (this.initialized) {
      throw new SyntaxError('Widget is already initialized, call this before initializing with .go()');
    }
    this.activeTab = index ? parseInt(index) : 0;
    return this;
  },

  /**
   * Executes the initialization of the Tabs widget
   */
  go: function() {
    var index = 0;
    this.tabs.getChildren().each(function(tab) {
      var a = Prime.Document.queryFirst('a', tab);
      var contentId = a.getAttribute('href');
      var content = Prime.Document.queryByID(contentId.substring(1));
      if (content === null) {
        throw new SyntaxError('A div is required with the following ID [' + a.getAttribute('href') + ']');
      }
      content.hide();
      a.addEventListener('click', this._handleClick, this);
      if (!tab.hasClass('prime-inactive')) {
        tab.setAttribute("data-tab-id", index++);
        content.addClass('prime-tab-content');
        this.tabContents[contentId] = content;
      }
    }, this);
    this.selectTab(this.activeTab);
    this.initialized = true;
    this.tabs.show();
  },

  /**
   * Select the active tab. Sets the prime-active class on the li and shows only the corresponding tab content.
   * @param index the index of the tab to activate
   */
  selectTab: function(index) {
    this.tabs.getChildren().each(function(tab) {
      tab.removeClass('prime-active');
    }, this);
    var tab = Prime.Document.queryFirst('li[data-tab-id="' + index + '"]', this.tabs);
    tab.addClass('prime-active');
    var contentId = Prime.Document.queryFirst('a', tab).getAttribute('href');

    for (var id in this.tabContents) {
      if (id === contentId) {
        this.tabContents[id].show();
      } else {
        this.tabContents[id].hide();
      }
    }
  },

  /**
   * Handle the tab click by showing the corresponding panel and hiding the others.
   * @param event
   * @private
   */
  _handleClick: function(event) {
    var tab = new Prime.Document.Element(event.currentTarget).parent();
    if (!tab.hasClass('prime-inactive')) {
      this.activeTab = parseInt(tab.getAttribute("data-tab-id"));
      this.selectTab(this.activeTab);
    }
    return false;
  }
};

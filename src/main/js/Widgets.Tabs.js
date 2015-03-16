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
 * @param activeTab (optional) Tab index of the active tab
 * @constructor
 */
Prime.Widgets.Tabs = function(element, activeTab) {

  this.activeTab = activeTab ? parseInt(activeTab) : 0;
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
  this.tabContents = [];

  this.tabs.getChildren().each(function(tab, index) {
    var a = Prime.Document.queryFirst('a', tab);
    tab.setAttribute("data-tab-id", index);
    var content = Prime.Document.queryByID(a.getAttribute('href').substring(1));
    if (content === null) {
      throw new SyntaxError('A div is required with the following ID [' + a.getAttribute('href') + ']');
    }
    content.addClass('prime-tab-content');
    this.tabContents.push(content);
    a.addEventListener('click', this._handleClick, this);
  }, this);
  this.selectTab(this.activeTab);
};

Prime.Widgets.Tabs.prototype = {

  /**
   * Select the active tab.
   * @param index the index of the tab to activate
   */
  selectTab: function(index) {
    this.tabs.getChildren().each(function(tab, i) {
      if (i === index) {
        tab.addClass('active');
        this.activeTab = index;
      } else {
        tab.removeClass('active');
      }
    });

    for (var i = 0; i < this.tabContents.length; i++) {
      if (index === i) {
        this.tabContents[i].show();
      } else {
        this.tabContents[i].hide();
      }
    };
  },

  /**
   * Handle the tab click by showing the corresponding panel and hiding the others.
   * @param event
   * @private
   */
  _handleClick: function(event) {
    var tab = event.currentTarget.parentNode;
    this.activeTab = parseInt(tab.getAttribute("data-tab-id"));
    this.selectTab(this.activeTab);
    return false;
  }
};

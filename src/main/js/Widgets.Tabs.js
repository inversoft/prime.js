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

Prime.Widgets.Tabs = function(element) {

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

  Prime.Document.query('li', this.tabs).each(function(li) {
    var link = Prime.Document.queryFirst('a', li);
    var content = Prime.Document.queryByID(link.getAttribute('href').substring(1));
    if (content === null) {
      throw new SyntaxError('A div is required with the following ID [' + link.getAttribute('href') + ']');
    }
    content.addClass('prime-tab-content');
    this.tabContents.push(content);
    li.addEventListener('click', this._handleClick, this);
  }, this);
  this.selectTab(0);
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
    }
    ;
  },

  /**
   * Handle the tab click by showing the corresponding panel and hiding the others.
   * @param event
   * @private
   */
  _handleClick: function(event) {
    var element = event.currentTarget;
    var activeIndex = 0;
    this.tabs.getChildren().each(function(tab, index) {
      if (tab.domElement === element) {
        activeIndex = index;
      }
    });
    this.selectTab(activeIndex);
  }
};

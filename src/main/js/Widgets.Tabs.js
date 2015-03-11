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

  this.tabContents = [];

  // tabs require an id if not using AJAX
  var tabCount = 0;
  Prime.Document.query('li', this.tabs).each(function(li) {
    var content;
    if (li.getID() === null) {
      li.setID('prime-tab_' + tabCount);
      content = Prime.Document.newElement("div");
      content.setAttribute("data-tab-id", li.getID());
      tabCount++;
    } else {
      content = Prime.Document.queryFirst('[data-tab-id="' + li.getID() + '"]');
    }
    content.addClass('prime-tabs-content');
    this.tabContents.push(content);
    li.addEventListener('click', this.handleClick, this);
  }, this);
  this.selectTab(0);
};

Prime.Widgets.Tabs.prototype = {
  selectTab: function(index) {
    this.tabs.getChildren().each(function(tab, i) {
      if (i === index) {
        tab.addClass('active');
      } else {
        tab.removeClass('active');
      }
    });

    for (var i in this.tabContents) {
      if (index === i) {
        this.tabContents[i].show();
      } else {
        this.tabContents[i].hide();
      }
    };

  },

  handleClick: function(event) {
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

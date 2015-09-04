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
  this.element = (element instanceof Prime.Document.Element) ? element : new Prime.Document.Element(element.domElement);

  if (this.element.getTagName().toLowerCase() === 'ul') {
    this.tabsContainer = this.element;
  } else {
    this.tabsContainer = this.element.queryFirst('ul');
  }

  if (this.tabsContainer === null) {
    throw new TypeError('Tabs requires a ul element. The passed element does not contain a ul element');
  }

  if (this.tabsContainer.hasClass('prime-initialized')) {
    throw new Error('This element has already been initialized. Call destroy before initializing again.');
  }

  this.tabsContainer.hide().addClass('prime-tabs');
  this.tabContents = {};
  this.tabs = {};

  var firstTabId = null;
  this.tabsContainer.query('li:not(prime-disabled)').each(function(tab) {
    var a = tab.queryFirst('a').addEventListener('click', this._handleClick, this);
    var contentId = a.getAttribute('href').substring(1);
    var content = Prime.Document.queryByID(contentId);
    if (content === null) {
      throw new Error('A div is required with the following ID [' + a.getAttribute('href') + ']');
    }

    content.hide();

    //if (!tab.hasClass('prime-disabled')) {
      content.addClass('prime-tab-content');
      this.tabContents[contentId] = content;
      this.tabs[contentId] = tab;

      if (firstTabId === null) {
        firstTabId = contentId;
        tab.addClass('first-child');
      }
    //}
  }, this);

  this.tabsContainer.queryLast('li:not("prime-disabled")').addClass('last-child');

  this.selectTab(firstTabId);
  this.tabsContainer.addClass('prime-initialized');
  this.tabsContainer.show();
};

Prime.Widgets.Tabs.prototype = {
  /**
   * Destroys the Tabs widget
   */
  destroy: function() {
    this.tabsContainer.getChildren().each(function(tab) {
      var a = Prime.Document.queryFirst('a', tab);
      a.removeEventListener('click', this._handleClick);
    }, this);
    for (var id in this.tabContents) {
      this.tabContents[id].removeClass('prime-tab-content').show();
    }
    this.tabsContainer.removeClass('prime-tabs prime-initialized').show();
  },

  /**
   * Hides the tab for the given Id.
   *
   * @param id The Id of the tab to hide.
   */
  hideTab: function(id) {
    this.tabs[id].hide();
    if (this.tabs[id].hasClass('prime-active')) {
      for (var tabId in this.tabs) {
        if (this.tabs.hasOwnProperty(tabId) && this.tabs[tabId].isVisible()) {
          this.selectTab(tabId);
        }
      }
    }
  },

  /**
   * Select the active tab. Sets the prime-active class on the li and shows only the corresponding tab content.
   *
   * @param id The Id of the tab to select.
   */
  selectTab: function(id) {
    for (var tabId in this.tabs) {
      if (this.tabs.hasOwnProperty(tabId)) {
        this.tabs[tabId].removeClass('prime-active');
      }
    }

    this.tabs[id].addClass('prime-active');
    for (var tabId in this.tabContents) {
      if (this.tabContents.hasOwnProperty(tabId) && tabId === id) {
        this.tabContents[tabId].show();
      } else {
        this.tabContents[tabId].hide();
      }
    }
  },

  /**
   * Shows the tab for the given Id.
   *
   * @param id The Id of the tab to hide.
   */
  showTab: function(id) {
    this.tabs[id].show();
    this.selectTab(id);
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handle the tab click by showing the corresponding panel and hiding the others.
   * @param event
   * @private
   */
  _handleClick: function(event) {
    var a = new Prime.Document.Element(event.currentTarget);
    if (!a.hasClass('prime-disabled')) {
      this.selectTab(a.getAttribute('href').substring(1));
    }

    return false;
  }
};

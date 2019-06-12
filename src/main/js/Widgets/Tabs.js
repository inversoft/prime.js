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

import {Utils} from "../Utils.js";
import {PrimeElement} from "../Document/PrimeElement.js";
import {PrimeDocument} from "../PrimeDocument.js";
import {PrimeStorage} from "../Storage.js";
import {PrimeRequest} from "../PrimeRequest.js";

class Tabs {
  /**
   * Constructs a new Tabs object for the given ul element.
   *
   * @param {PrimeElement|Element|EventTarget} element The ul element to build the tab widget from
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    if (this.element.getTagName().toLowerCase() === 'ul') {
      this.tabsContainer = this.element;
    } else {
      this.tabsContainer = this.element.queryFirst('ul');
    }

    if (this.tabsContainer === null) {
      throw new TypeError('Tabs requires a ul element. The passed element does not contain a ul element');
    }

    this._setInitialOptions();
    this.tabContents = {};
    this.tabs = {};
    this.tabArray = [];
    this.selectedTab = null;
  }

  /**
   * Destroys the Tabs widget
   */
  destroy() {
    this.tabsContainer.query('a').each(function(a) {
      a.removeEventListener('click', this._handleClick);
    }.bind(this));

    for (let i = 0; i < this.tabs.length; i++) {
      this.tabs[i].removeClass(this.options.tabContentClass);
    }
  }

  /**
   * Hides the tab for the given Id.
   *
   * @param id The Id of the tab to hide.
   */
  hideTab(id) {
    const tab = this.tabs[id];
    tab.hide();
    this.redraw();
  }

  /**
   * Initializes the Tabs widget. Call this after you have set all the initial options.
   *
   * @returns {Tabs} This.
   */
  initialize() {
    this.tabsContainer.query('li:not(.disabled)').each(function(tab) {
      const a = tab.queryFirst('a').addEventListener('click', this._handleClick);
      const dataSet = tab.getDataSet();

      const href = a.getAttribute('href');
      const isAnchor = href.charAt(0) === '#';
      if (isAnchor) {
        dataSet.tabId = href.substring(1);
        dataSet.tabUrl = '';
      } else {
        dataSet.tabId = href;
        dataSet.tabUrl = href;
      }

      this.tabs[dataSet.tabId] = tab;
      this.tabArray.push(tab);

      let content = PrimeDocument.queryById(dataSet.tabId);
      if (content === null && isAnchor) {
        throw new Error('A div is required with the following ID [' + dataSet.tabId + ']');
      } else if (content === null) {
        content = PrimeDocument.newElement('<div>').insertAfter(this.element).setAttribute('id', href);
      }

      content.hide();

      content.addClass(this.options.tabContentClass);
      this.tabContents[dataSet.tabId] = content;
    }.bind(this));

    if (this.options.deepLinkingEnabled) {
      const tabId = window.location.hash.replace(/^#/, '');
      if (Utils.isDefined(tabId) && Utils.isDefined(this.tabs[tabId])) {
        this.selectTab(tabId);
      }
    }

    this.redraw();
    return this;
  }

  /**
   * Re-applies the first-child, last-child, and active classes based on the current state of the tabs. If there
   * is no tab that is active, this also selects the first tab that is visible.
   */
  redraw() {
    let firstVisible = null;
    let lastVisible = null;
    let selectNew = false;
    let noneActive = true;
    for (let i = 0; i < this.tabArray.length; i++) {
      if (this.tabArray[i].isVisible()) {
        if (firstVisible === null) {
          firstVisible = this.tabArray[i];
        }

        lastVisible = this.tabArray[i];

        if (this.tabArray[i].hasClass('selected')) {
          noneActive = false;
        }
      } else if (this.tabArray[i].hasClass('selected')) {
        selectNew = true;
      }

      this.tabArray[i].removeClass('first-visible-tab');
      this.tabArray[i].removeClass('last-visible-tab');
    }

    firstVisible.addClass('first-visible-tab');
    lastVisible.addClass('last-visible-tab');

    let tabId = null;
    if (selectNew || noneActive) {
      if (PrimeStorage.supported && this.options.localStorageKey !== null) {
        const state = PrimeStorage.getSessionObject(this.options.localStorageKey);
        if (state !== null) {
          tabId = state.tabId;
        }
      }

      // If no tabId was found or the tab is not currently visible, select the first visible
      if (tabId === null || !this.tabs[tabId] || !this.tabs[tabId].isVisible()) {
        tabId = firstVisible.getDataSet().tabId;
      }

      this.selectTab(tabId);
    }

    // If error class handling was enabled, add the error class to the tab and set focus
    if (this.options.errorClass) {
      for (tabId in this.tabContents) {
        if (this.tabContents.hasOwnProperty(tabId)) {
          const errorElement = this.tabContents[tabId].queryFirst('.' + this.options.errorClass);
          if (errorElement !== null) {
            this.tabs[tabId].queryFirst('a').addClass(this.options.errorClass);
            this.selectTab(tabId);
          }
        }
      }
    }
  }

  /**
   * Select the active tab. Sets the active class on the li and shows only the corresponding tab content.
   *
   * @param id The Id of the tab to select.
   */
  selectTab(id) {
    if (this.selectedTab !== null && this.selectedTab.getDataSet().tabId === id) {
      return;
    }

    for (const tabId in this.tabs) {
      if (this.tabs.hasOwnProperty(tabId)) {
        this.tabs[tabId].removeClass('selected');
      }
    }

    this.tabs[id].addClass('selected');
    this.selectedTab = this.tabs[id];
    for (const tabId in this.tabContents) {
      if (this.tabContents.hasOwnProperty(tabId) && tabId === id) {
        this.tabContents[tabId].show('block');
        if (this.options.selectCallback) {
          this.options.selectCallback(this.tabs[tabId], this.tabContents[tabId]);
        }
      } else {
        this.tabContents[tabId].hide();
      }
    }

    // Save current selected tab state in local storage. The JSON object isn't necessary at the moment,
    // but we can tack on other properties as needed for additional state in the future.
    if (PrimeStorage.supported && this.options.localStorageKey !== null) {
      const data = {
        tabId: id
      };
      PrimeStorage.setSessionObject(this.options.localStorageKey, data);
    }

    const ajaxURL = this.selectedTab.getDataSet().tabUrl;
    if (ajaxURL !== '') {
      this.selectedTab.addClass('loading');
      this.tabContents[id].setHTML('');
      this.tabContents[id].addClass('loading');
      new PrimeRequest(ajaxURL, 'GET')
          .withSuccessHandler(this._handleAJAXResponse)
          .withErrorHandler(this._handleAJAXResponse)
          .go();
    }
  }

  /**
   * Shows the tab for the given Id.
   *
   * @param {String} id The Id of the tab to hide.
   */
  showTab(id) {
    this.tabs[id].show();
    this.redraw();
  }

  /**
   * Adds a callback for AJAX calls. This is invoked after the AJAX load completes and the HTML is inserted into the
   * DOM. The function is passed the container for the tab that was selected.
   *
   * @param {Function} callback The callback function.
   * @returns {Tabs} This Tabs.
   */
  withAJAXCallback(callback) {
    this.options.ajaxCallback = callback;
    return this;
  }

  /**
   * Disable the default behavior of allowing a deep link provided on the URL to set the default tab during render.
   *
   * @returns {Tabs} This Tabs.
   */
  withDeepLinkingDisabled() {
    this.options.deepLinkingEnabled = false;
    return this;
  }

  /**
   * Enable error class handling. When this option is used, if the specified error class is found on any element
   * in the tab content the same error class will be added to the tab to identify the tab contains errors.
   *
   * @returns {Tabs} This Tabs.
   */
  withErrorClassHandling(errorClass) {
    this.options.errorClass = errorClass;
    return this;
  }

  /**
   * Enables local storage of the currently selected tab. If the user navigates away from the page and back, the same
   * tab will be selected. This key is how the selected tab is stored in local storage and by setting a key you also
   * enable this feature.
   *
   * @param {?String} key The local storage key.
   * @returns {Tabs} This Tabs.
   */
  withLocalStorageKey(key) {
    this.options.localStorageKey = key;
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Tabs} This Tabs.
   */
  withOptions(options) {
    if (!Utils.isDefined(options)) {
      return this;
    }

    for (let option in options) {
      if (options.hasOwnProperty(option)) {
        this.options[option] = options[option];
      }
    }
    return this;
  }

  /**
   * Specifies a callback function that is called whenever tabs are changed.
   *
   * @param {?Function} callback The callback function.
   * @returns {Tabs} This Tabs.
   */
  withSelectCallback(callback) {
    this.options.selectCallback = callback;
    return this;
  }

  /**
   * Sets the class name for the tab content elements.
   *
   * @param className {String} The class name.
   * @returns {Tabs}
   */
  withTabContentClass(className) {
    this.options.tabContentClass = className;
    return this;
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handles the AJAX response.
   *
   * @param {XMLHttpRequest} xhr The AJAX response.
   * @private
   */
  _handleAJAXResponse(xhr) {
    this.selectedTab.removeClass('loading');
    const container = this.tabContents[this.selectedTab.getDataSet().tabId];
    container.removeClass('loading');
    container.setHTML(xhr.responseText);

    if (this.options.ajaxCallback !== null) {
      this.options.ajaxCallback(container);
    }
  }

  /**
   * Handle the tab click by showing the corresponding panel and hiding the others.
   *
   * @param {MouseEvent} event The click event on the anchor tag.
   * @private
   */
  _handleClick(event) {
    Utils.stopEvent(event);
    const a = new PrimeElement(event.currentTarget);
    if (!a.hasClass('disabled')) {
      const href = a.getAttribute('href');
      if (href.charAt(0) === '#') {
        this.selectTab(href.substring(1));
      } else {
        this.selectTab(href);
      }
    }
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      ajaxCallback: null,
      errorClass: null,
      deepLinkingEnabled: true,
      localStorageKey: null,
      selectCallback: null,
      tabContentClass: 'prime-tab-content'
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {Tabs};

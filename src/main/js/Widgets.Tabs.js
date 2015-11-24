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

  this._setInitialOptions();
  this.tabsContainer.hide().addClass('prime-tabs');
  this.tabContents = {};
  this.tabs = {};
  this.tabArray = [];
  this.selectedTab = null;

  // Check if local storage is enabled to save selected tab
  this.localStorageSupported = typeof(Storage) !== 'undefined' && this.options.localStorageKey !== null;

  this.tabsContainer.query('li:not(.prime-disabled)').each(function(tab) {
    var a = tab.queryFirst('a').addEventListener('click', this._handleClick, this);
    var dataSet = tab.getDataSet();

    var href = a.getAttribute('href');
    var isAnchor = href.charAt(0) === '#';
    if (isAnchor) {
      dataSet.tabId = href.substring(1);
      dataSet.tabURL = '';
    } else {
      dataSet.tabId = href;
      dataSet.tabURL = href;
    }

    this.tabs[dataSet.tabId] = tab;
    this.tabArray.push(tab);

    var content = Prime.Document.queryByID(dataSet.tabId);
    if (content === null && isAnchor) {
      throw new Error('A div is required with the following ID [' + dataSet.tabId + ']');
    } else if (content === null) {
      content = Prime.Document.newElement('<div>').insertAfter(this.element).setAttribute('id', href);
    }

    content.hide();

    content.addClass('prime-tab-content');
    this.tabContents[dataSet.tabId] = content;
  }, this);

  this.tabsContainer.addClass('prime-initialized');
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

    for (var i = 0; i < this.tabs.length; i++) {
      this.tabs[i].removeClass('prime-tab-content');
    }

    this.tabsContainer.removeClass('prime-tabs prime-initialized');
  },

  /**
   * Hides the tab for the given Id.
   *
   * @param id The Id of the tab to hide.
   */
  hideTab: function(id) {
    var tab = this.tabs[id];
    tab.hide();
    this.redraw();
  },

  /**
   * Re-applies the first-child, last-child, and prime-active classes based on the current state of the tabs. If there
   * is no tab that is active, this also selects the first tab that is visible.
   */
  redraw: function() {
    var firstVisible = null;
    var lastVisible = null;
    var selectNew = false;
    var noneActive = true;
    for (var i = 0; i < this.tabArray.length; i++) {
      if (this.tabArray[i].isVisible()) {
        if (firstVisible === null) {
          firstVisible = this.tabArray[i];
        }

        lastVisible = this.tabArray[i];

        if (this.tabArray[i].hasClass('prime-active')) {
          noneActive = false;
        }
      } else if (this.tabArray[i].hasClass('prime-active')) {
        selectNew = true;
      }

      this.tabArray[i].removeClass('first-child last-child');
    }

    firstVisible.addClass('first-child');
    lastVisible.addClass('last-child');

    var tabId = null;
    if (selectNew || noneActive) {
      if (this.localStorageSupported) {
        var item = sessionStorage.getItem(this.options.localStorageKey);
        if (item !== null) {
          tabId = JSON.parse(item).tabId;
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
          var errorElement = this.tabContents[tabId].queryFirst('.' + this.options.errorClass);
          if (errorElement !== null) {
            this.tabs[tabId].queryFirst('a').addClass(this.options.errorClass);
            this.selectTab(tabId);
          }
        }
      }
    }
  },

  /**
   * Render the Tabs widget. Call this after you have set all the initial options.
   *
   * @returns {Prime.Widgets.Tabs} This Tabs.
   */
  render: function() {
    this.tabsContainer.show();
    this.redraw();
    return this;
  },

  /**
   * Select the active tab. Sets the prime-active class on the li and shows only the corresponding tab content.
   *
   * @param id The Id of the tab to select.
   */
  selectTab: function(id) {
    if (this.selectedTab !== null && this.selectedTab.getDataSet().tabId === id) {
      return;
    }

    for (var tabId in this.tabs) {
      if (this.tabs.hasOwnProperty(tabId)) {
        this.tabs[tabId].removeClass('prime-active');
      }
    }

    this.tabs[id].addClass('prime-active');
    this.selectedTab = this.tabs[id];
    for (tabId in this.tabContents) {
      if (this.tabContents.hasOwnProperty(tabId) && tabId === id) {
        this.tabContents[tabId].show();
      } else {
        this.tabContents[tabId].hide();
      }
    }

    // Save current selected tab state in local storage. The JSON object isn't necessary at the moment,
    // but we can tack on other properties as needed for additional state in the future.
    if (this.localStorageSupported) {
      var data = {
        'tabId': id
      };
      sessionStorage.setItem(this.options.localStorageKey, JSON.stringify(data));
    }

    var ajaxURL = this.selectedTab.getDataSet().tabURL;
    if (ajaxURL !== '') {
      this.selectedTab.addClass('prime-loading');
      this.tabContents[id].setHTML('');
      this.tabContents[id].addClass('prime-loading');
      new Prime.Ajax.Request(ajaxURL, 'GET')
          .withSuccessHandler(this._handleAJAXResponse)
          .withErrorHandler(this._handleAJAXResponse)
          .withContext(this)
          .go();
    }
  },

  /**
   * Shows the tab for the given Id.
   *
   * @param {String} id The Id of the tab to hide.
   */
  showTab: function(id) {
    this.tabs[id].show();
    this.redraw();
  },

  /**
   * Adds a callback for AJAX calls. This is invoked after the AJAX load completes and the HTML is inserted into the
   * DOM. The function is passed the container for the tab that was selected.
   *
   * @returns {Prime.Widgets.Tabs} This Tabs.
   */
  withAJAXCallback: function(callback) {
    this.options['ajaxCallback'] = callback;
    return this;
  },

  /**
   * Enable error class handling. When this option is used, if the specified error class is found on any element
   * in the tab content the same error class will be added to the tab to identify the tab contains errors.
   *
   * @returns {Prime.Widgets.Tabs} This Tabs.
   */
  withErrorClassHandling: function(errorClass) {
    this.options['errorClass'] = errorClass;
    return this;
  },

  /**
   * Enables local storage of the currently selected tab. If the user navigates away from the page and back, the same
   * tab will be selected. This key is how the selected tab is stored in local storage and by setting a key you also
   * enable this feature.
   *
   * @param {String} key The local storage key.
   * @returns {Prime.Widgets.Tabs} This Tabs.
   */
  withLocalStorageKey: function(key) {
    this.options['localStorageKey'] = key;
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.Tabs} This Tabs.
   */
  withOptions: function(options) {
    if (typeof options === 'undefined' || options === null) {
      return this;
    }

    for (var option in options) {
      if (options.hasOwnProperty(option)) {
        this.options[option] = options[option];
      }
    }
    return this;
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handles the AJAX response.
   *
   * @param {XMLHttpRequest} xhr The AJAX response.
   * @private
   */
  _handleAJAXResponse: function(xhr) {
    this.selectedTab.removeClass('prime-loading');
    var container = this.tabContents[this.selectedTab.getDataSet().tabId];
    container.removeClass('prime-loading');
    container.setHTML(xhr.responseText);

    if (this.options['ajaxCallback'] !== null) {
      this.options['ajaxCallback'](container);
    }
  },

  /**
   * Handle the tab click by showing the corresponding panel and hiding the others.
   *
   * @param event The click event on the anchor tag.
   * @private
   */
  _handleClick: function(event) {
    var a = new Prime.Document.Element(event.currentTarget);
    if (!a.hasClass('prime-disabled')) {
      var href = a.getAttribute('href');
      if (href.charAt(0) === '#') {
        this.selectTab(href.substring(1));
      } else {
        this.selectTab(href);
      }
    }

    return false;
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'ajaxCallback': null,
      'errorClass': null,
      'localStorageKey': null
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.element);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};

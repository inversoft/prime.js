/*
 * Copyright (c) 2017, Inversoft Inc., All Rights Reserved
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
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new dialog box from an element.
 *
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element for the HTMLDialog widget.
 * @constructor
 */
Prime.Widgets.HTMLDialog = function(element) {
  Prime.Utils.bindAll(this);

  this.element = Prime.Document.Element.wrap(element);
  this._setInitialOptions();
  this.draggable = null;
};

Prime.Widgets.HTMLDialog.prototype = {
  /**
   * Closes the dialog, destroys the HTML and updates or hides the overlay.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  close: function() {
    this.element.removeClass('open');
    if (this.draggable !== null) {
      this.draggable.destroy();
      this.draggable = null;
    }

    setTimeout(function() {
      this.element.hide();

      var highestZIndex = this._determineZIndex();
      if (highestZIndex !== 0) {
        Prime.Widgets.Overlay.instance.setZIndex(highestZIndex);
      } else {
        Prime.Widgets.Overlay.instance.close();
      }
    }.bind(this), this.options['closeTimeout']);

    return this;
  },

  /**
   * Destroys the dialog by calling the close function.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  destroy: function() {
    this.close();
    return this;
  },

  /**
   * Initializes the dialog.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  initialize: function() {
    this.element.hide();
    return this;
  },

  /**
   * Opens the dialog.
   *
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  open: function() {
    var highestZIndex = this._determineZIndex();
    Prime.Widgets.Overlay.instance.open(highestZIndex + this.options['zIndexOffset']);
    this.element.setStyle('zIndex', (highestZIndex + this.options['zIndexOffset'] + 10).toString());
    this.element.show();
    this.element.addClass('open');

    // Position the fixed dialog in the center of the screen
    var windowHeight = Prime.Window.getInnerHeight();
    var dialogHeight = this.element.getHeight();
    this.element.setTop(((windowHeight - dialogHeight) / 2) - 20);

    if (this.options['callback'] !== null) {
      this.options['callback'](this.element);
    }

    this._setupButtons();

    if (this.draggable === null) {
      if (this.options['draggableElementSelector'] !== null && this.element.queryFirst(this.options['draggableElementSelector']) !== null) {
        this.draggable = new Prime.Widgets.Draggable(this.element, this.options['draggableElementSelector']).initialize();
      }
    }

    return this;
  },

  /**
   * Updates the HTML contents of the dialog.
   *
   * @param html {String} The HTML.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  setHTML: function(html) {
    this.element.setHTML(html);
    this._setupButtons();
    return this;
  },

  /**
   * Sets the callback that is called after the dialog has been fetched and rendered.
   *
   * @param callback {function} The callback function.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  withCallback: function(callback) {
    this.options['callback'] = callback;
    return this;
  },

  /**
   * Sets the class name for the dialog element.
   *
   * @param className {string} The class name.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  withClassName: function(className) {
    this.options['className'] = className;
    return this;
  },

  /**
   * Sets the close button element selector that is used to setup the close button in the HTML that was returned from
   * the server.
   *
   * @param selector {string} The element selector.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  withCloseButtonElementSelector: function(selector) {
    this.options['closeButtonElementSelector'] = selector;
    return this;
  },

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  withCloseTimeout: function(timeout) {
    this.options['closeTimeout'] = timeout;
    return this;
  },

  /**
   * Sets the draggable element selector that is used for the Prime.Widgets.Draggable.
   *
   * @param selector {string} The element selector.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  withDraggableButtonElementSelector: function(selector) {
    this.options['draggableElementSelector'] = selector;
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.HTMLDialog} This.
   */
  withOptions: function(options) {
    if (!Prime.Utils.isDefined(options)) {
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

  _determineZIndex: function() {
    var highestZIndex = 0;
    Prime.Document.query('.' + this.options['className']).each(function(dialog) {
      var zIndex = parseInt(dialog.getComputedStyle()['zIndex']);
      if (dialog.isVisible() && zIndex > highestZIndex) {
        highestZIndex = zIndex;
      }
    });
    return highestZIndex;
  },

  _handleCloseClickEvent: function(event) {
    this.close();
    Prime.Utils.stopEvent(event);
  },

  _setupButtons: function() {
    this.element.query(this.options['closeButtonElementSelector']).each(function(e) {
      e.addEventListener('click', this._handleCloseClickEvent);
    }.bind(this));
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'callback': null,
      'className': 'prime-dialog',
      'closeButtonElementSelector': '[data-dialog-role="close-button"]',
      'closeTimeout': 200,
      'draggableElementSelector': '[data-dialog-role="draggable"]',
      'zIndexOffset': 1000
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.element);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};

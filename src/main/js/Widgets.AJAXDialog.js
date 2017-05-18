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
 * Constructs a new dialog box, which is dynamically built and then populated with the HTML returned from an AJAX call.
 *
 * @constructor
 */
Prime.Widgets.AJAXDialog = function() {
  Prime.Utils.bindAll(this);
  this.callback = null;
  this.element = null;
};

Prime.Widgets.AJAXDialog.prototype = {
  /**
   * Closes the dialog, destroys the HTML and updates or hides the overlay.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  close: function() {
    this.element.removeClass('open');
    setTimeout(function() {
      this.element.removeFromDOM();
      this.element = null;

      var highestZIndex = this._determineZIndex();
      if (highestZIndex !== 0) {
        Prime.Widgets.Overlay.instance.setZIndex(highestZIndex);
      } else {
        Prime.Widgets.Overlay.instance.close();
      }
    }.bind(this), 200);

    return this;
  },

  /**
   * Destroys the dialog by calling the close function.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  destroy: function() {
    this.close();
    return this;
  },

  /**
   * Initializes the dialog.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  initialize: function() {
    this._setInitialOptions();
    return this;
  },

  /**
   * Opens the dialog by making the AJAX GET request to the given URI and the opening then dialog.
   *
   * @param uri {string} The URI to make the AJAX GET request to.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  open: function(uri) {
    new Prime.Ajax.Request(uri, 'GET')
        .withSuccessHandler(this._handleAjaxDialogResponse)
        .withErrorHandler(this._handleAjaxDialogResponse)
        .go();
    return this;
  },

  /**
   * Opens the dialog by making the AJAX POST request to the given URI with the given form and extra data (optional)
   * and then opening the dialog.
   *
   * @param uri {string} The URI to make the AJAX POST request to.
   * @param form {FormElement|Prime.Document.Element} The Form element to retrieve the data from.
   * @param extraData {object} (Optional) Extra data to send with the POST.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  openPost: function(uri, form, extraData) {
    new Prime.Ajax.Request(uri, 'POST')
        .withDataFromForm(form)
        .withData(extraData)
        .withSuccessHandler(this._handleAjaxDialogResponse)
        .go();
    return this;
  },

  /**
   * Positions the dialog on the screen.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  position: function() {
    var innerHeight = Prime.Window.getInnerHeight();
    var innerWidth = Prime.Window.getInnerWidth();

    var scrollTop = Prime.Window.getScrollTop();
    var elemHeight = this.element.getHeight();
    var elemWidth = this.element.getWidth();
    this.element.setLeft((innerWidth / 2) - (elemWidth / 2));
    this.element.setTop((innerHeight / 2) - (elemHeight / 2) + scrollTop);
    return this;
  },

  /**
   * Updates the HTML contents of the dialog.
   *
   * @param html {String} The HTML.
   * @returns {Prime.Widgets.AJAXDialog} This.
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
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withCallback: function(callback) {
    this.callback = callback;
    return this;
  },

  /**
   * Sets the class name for the dialog element.
   *
   * @param className {string} The class name.
   * @returns {Prime.Widgets.AJAXDialog} This.
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
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withCloseButtonElementSelector: function(selector) {
    this.options['closeButtonElementSelector'] = selector;
    return this;
  },

  /**
   * Sets the draggable element selector that is used for the Prime.Widgets.Draggable.
   *
   * @param selector {string} The element selector.
   * @returns {Prime.Widgets.AJAXDialog} This.
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
   * @returns {Prime.Widgets.DateTimePicker} This DateTimePicker.
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

  _handleAjaxDialogResponse: function(xhr) {
    this.element = Prime.Document.newElement('<div/>', {class: this.options['className']}).appendTo(document.body);
    this.setHTML(xhr.responseText);
    new Prime.Widgets.Draggable(this.element, this.options['draggableElementSelector']);

    var highestZIndex = this._determineZIndex();
    Prime.Widgets.Overlay.instance.open(highestZIndex + this.options['zIndexOffset']);
    this.element.setStyle('zIndex', (highestZIndex + this.options['zIndexOffset'] + 10).toString());
    this.element.addClass('open');

    var windowHeight = Prime.Window.getInnerHeight();
    var maxDialogHeight = Math.floor(windowHeight * 0.9);
    if (this.element.getHeight() > maxDialogHeight) {
      this.element.setHeight(maxDialogHeight);
    }

    if (this.callback !== null) {
      this.callback(this.element);
    }

    // The callback allows the dialog to initialize itself and hide stuff etc. Wait to position it.
    this.position();
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
      'className': 'prime-dialog',
      'closeButtonElementSelector': '[data-dialog-role="close-button"]',
      'draggableElementSelector': '[data-dialog-role="draggable"]',
      'zIndexOffset': 1000
    };
  }
};

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

  this.draggable = null;
  this.element = null;
  this._setInitialOptions();
};

Prime.Widgets.AJAXDialog.prototype = {
  /**
   * Closes the dialog, destroys the HTML and updates or hides the overlay.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  close: function() {
    this.element.removeClass('open');
    if (this.draggable !== null) {
      this.draggable.destroy();
      this.draggable = null;
    }

    setTimeout(function() {
      this.element.removeFromDOM();
      this.element = null;

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
        .withSuccessHandler(this._handleAJAXDialogResponse)
        .withErrorHandler(this._handleAJAXDialogResponse)
        .go();
    return this;
  },

  /**
   * Opens the dialog by making the AJAX POST request to the given URI with the given form and extra data (optional)
   * and then opening the dialog.
   *
   * @param uri {string} The URI to make the AJAX POST request to.
   * @param form {HTMLFormElement|Prime.Document.Element} The Form element to retrieve the data from.
   * @param extraData {object} (Optional) Extra data to send with the POST.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  openPost: function(uri, form, extraData) {
    new Prime.Ajax.Request(uri, 'POST')
        .withDataFromForm(form)
        .withData(extraData)
        .withSuccessHandler(this._handleAJAXDialogResponse)
        .go();
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
   * Sets any additional classes that should be on the dialog.
   *
   * @param classes {string} The list of additional classes.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withAdditionalClasses: function(classes) {
    this.options['additionalClasses'] = classes;
    return this;
  },

  /**
   * Sets the callback that is called after the dialog has been fetched and rendered.
   *
   * @param callback {function} The callback function.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withCallback: function(callback) {
    this.options['callback'] = callback;
    return this;
  },

  /**
   * Sets the class name for the dialog element.
   *
   * @param className {string} The class name.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withClassName: function(className) {
    if (className.indexOf(' ') !== -1) {
      throw 'Invalid class name [' + className + ']. You can use the additionalClasses options to add more classes.';
    }

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
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withCloseTimeout: function(timeout) {
    this.options['closeTimeout'] = timeout;
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
   * Sets an error callback for AJAX form handling. This is called after a failed form submission.
   *
   * @param callback {Function} The callback function.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withFormErrorCallback: function(callback) {
    this.options['formErrorCallback'] = callback;
    return this;
  },

  /**
   * Sets whether or not forms inside the dialog are handled via AJAX or not.
   *
   * @param enabled {boolean} The choice.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withFormHandling: function(enabled) {
    this.options['formHandling'] = enabled;
    return this;
  },

  /**
   * Sets a pre-submit callback for AJAX form handling. This is called before the form is submitted.
   *
   * @param callback {Function} The callback function.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withFormPreSubmitCallback: function(callback) {
    this.options['formPreSubmitCallback'] = callback;
    return this;
  },

  /**
   * Sets a success callback for AJAX form handling. This is called after a successful form submission.
   *
   * @param callback {Function} The callback function.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withFormSuccessCallback: function(callback) {
    this.options['formSuccessCallback'] = callback;
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.AJAXDialog} This.
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

  _handleAJAXDialogResponse: function(xhr) {
    this.element = Prime.Document.newElement('<div/>', {class: this.options['className'] + ' ' + this.options['additionalClasses']}).appendTo(document.body);
    this.setHTML(xhr.responseText);

    var highestZIndex = this._determineZIndex();
    Prime.Widgets.Overlay.instance.open(highestZIndex + this.options['zIndexOffset']);
    this.element.setStyle('zIndex', (highestZIndex + this.options['zIndexOffset'] + 10).toString());
    this.element.addClass('open');

    // Call the callback before positioning to ensure all changes to the dialog have been made
    if (this.options['callback'] !== null) {
      this.options['callback'](this);
    }

    // Setup forms if enabled
    if (this.options['formHandling']) {
      this.form = this.element.queryFirst('form').addEventListener('submit', this._handleAJAXFormSubmit);
    }

    // Position the fixed dialog in the center of the screen
    var windowHeight = Prime.Window.getInnerHeight();
    var dialogHeight = this.element.getHeight();
    this.element.setTop(((windowHeight - dialogHeight) / 2) - 20);

    if (this.draggable === null) {
      if (this.options['draggableElementSelector'] !== null && this.element.queryFirst(this.options['draggableElementSelector']) !== null) {
        this.draggable = new Prime.Widgets.Draggable(this.element, this.options['draggableElementSelector']).initialize();
      }
    }
  },

  _handleAJAXFormError: function(xhr) {
    this.setHTML(xhr.responseText);
    this.form = this.element.queryFirst('form').addEventListener('submit', this._handleAJAXFormSubmit);

    if (this.options['formErrorCallback'] !== null) {
      this.options['formErrorCallback'](this);
    }
  },

  _handleAJAXFormSuccess: function(xhr) {
    if (this.options['formSuccessCallback'] !== null) {
      this.options['formSuccessCallback'](this);
    } else {
      var successURI = this.form.getDataSet().ajaxSuccessUri;
      if (successURI !== undefined) {
        window.location = successURI;
      } else {
        window.location.reload();
      }
    }
  },

  _handleAJAXFormSubmit: function(event) {
    Prime.Utils.stopEvent(event);

    if (this.options['formPreSubmitCallback'] !== null) {
      this.options['formPreSubmitCallback'](this);
    }

    new Prime.Ajax.Request(this.form.getAttribute('action'), this.form.getAttribute('method'))
        .withDataFromForm(this.form)
        .withSuccessHandler(this._handleAJAXFormSuccess)
        .withErrorHandler(this._handleAJAXFormError)
        .go();
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
      'additionalClasses': '',
      'callback': null,
      'className': 'prime-dialog',
      'closeButtonElementSelector': '[data-dialog-role="close-button"]',
      'closeTimeout': 200,
      'draggableElementSelector': '[data-dialog-role="draggable"]',
      'formErrorCallback': null,
      'formHandling': false,
      'formPreSubmitCallback': null,
      'formSuccessCallback': null,
      'zIndexOffset': 1000
    };
  }
};

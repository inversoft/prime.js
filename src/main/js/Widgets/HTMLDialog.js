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
'use strict';

import {PrimeElement} from "../Document/PrimeElement.js";
import {Utils} from "../Utils.js";
import {PrimeWindow} from "../Window.js";
import {Overlay} from "./Overlay.js";
import {Draggable} from "./Draggable.js";
import {PrimeDocument} from "../PrimeDocument.js";

class HTMLDialog {
  /**
   * Constructs a new dialog box from an element.
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element for the HTMLDialog widget.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    this._setInitialOptions();
    this.draggable = null;
  }

  /**
   * Closes the dialog, destroys the HTML and updates or hides the overlay.
   * @returns {HTMLDialog} This.
   */
  close() {
    this.element.removeClass('open');
    if (this.draggable !== null) {
      this.draggable.destroy();
      this.draggable = null;
    }

    setTimeout(function() {
      this.element.hide();

      const highestZIndex = this._determineZIndex();
      if (highestZIndex !== 0) {
        Overlay.instance.setZIndex(highestZIndex);
      } else {
        Overlay.instance.close();
      }
    }.bind(this), this.options.closeTimeout);

    return this;
  }

  /**
   * Destroys the dialog by calling the close function.
   * @returns {HTMLDialog} This.
   */
  destroy() {
    this.close();
    return this;
  }

  /**
   * Initializes the dialog.
   * @returns {HTMLDialog} This.
   */
  initialize() {
    this.element.hide();
    return this;
  }

  /**
   * Opens the dialog.
   *
   * @returns {HTMLDialog} This.
   */
  open() {
    const highestZIndex = this._determineZIndex();
    Overlay.instance.open(highestZIndex + this.options.zIndexOffset);
    this.element.setStyle('zIndex', (highestZIndex + this.options.zIndexOffset + 10).toString());
    this.element.show();
    this.element.addClass('open');

    // Call the callback before positioning to ensure all changes to the dialog have been made
    if (this.options.callback !== null) {
      this.options.callback(this);
    }

    // Position the fixed dialog in the center of the screen
    const windowHeight = PrimeWindow.getInnerHeight();
    const dialogHeight = this.element.getHeight();
    this.element.setTop(((windowHeight - dialogHeight) / 2) - 20);

    this._setupButtons();

    if (this.draggable === null) {
      if (this.options.draggableElementSelector !== null && this.element.queryFirst(this.options.draggableElementSelector) !== null) {
        this.draggable = new Draggable(this.element, this.options.draggableElementSelector).initialize();
      }
    }

    return this;
  }

  /**
   * Updates the HTML contents of the dialog.
   *
   * @param html {String} The HTML.
   * @returns {HTMLDialog} This.
   */
  setHTML(html) {
    this.element.setHTML(html);
    this._setupButtons();
    return this;
  }

  /**
   * Sets the callback that is called after the dialog has been fetched and rendered.
   *
   * @param callback {function} The callback function.
   * @returns {HTMLDialog} This.
   */
  withCallback(callback) {
    this.options.callback = callback;
    return this;
  }

  /**
   * Sets the class name for the dialog element.
   *
   * @param className {string} The class name.
   * @returns {HTMLDialog} This.
   */
  withClassName(className) {
    this.options.className = className;
    return this;
  }

  /**
   * Sets the close button element selector that is used to setup the close button in the HTML that was returned from
   * the server.
   *
   * @param selector {string} The element selector.
   * @returns {HTMLDialog} This.
   */
  withCloseButtonElementSelector(selector) {
    this.options.closeButtonElementSelector = selector;
    return this;
  }

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {HTMLDialog} This.
   */
  withCloseTimeout(timeout) {
    this.options.closeTimeout = timeout;
    return this;
  }

  /**
   * Sets the draggable element selector that is used for the Draggable.
   *
   * @param selector {string} The element selector.
   * @returns {HTMLDialog} This.
   */
  withDraggableButtonElementSelector(selector) {
    this.options.draggableElementSelector = selector;
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {HTMLDialog} This.
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

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  _determineZIndex() {
    let highestZIndex = 0;
    PrimeDocument.query('.' + this.options.className).each(function(dialog) {
      const zIndex = parseInt(dialog.getComputedStyle()['zIndex']);
      if (dialog.isVisible() && zIndex > highestZIndex) {
        highestZIndex = zIndex;
      }
    });
    return highestZIndex;
  }

  _handleCloseClickEvent(event) {
    Utils.stopEvent(event);
    this.close();
  }

  _setupButtons() {
    this.element.query(this.options.closeButtonElementSelector).each(function(e) {
      e.addEventListener('click', this._handleCloseClickEvent);
    }.bind(this));
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      callback: null,
      className: 'prime-dialog',
      closeButtonElementSelector: '[data-dialog-role="close-button"]',
      closeTimeout: 200,
      draggableElementSelector: '[data-dialog-role="draggable"]',
      zIndexOffset: 1000
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {HTMLDialog};

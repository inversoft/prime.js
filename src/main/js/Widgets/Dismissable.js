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

class Dismissable {
  /**
   * Constructs a new Dismissable object for the given element.
   *
   * @param {PrimeElement|Element|EventTarget} element The Element for the Dismissable widget.
   * @param {PrimeElement|Element|EventTarget} dismissButton The Element for the Dismissable button.
   * @constructor
   */
  constructor(element, dismissButton) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    this.dismissButton = dismissButton;
    this._setInitialOptions();
  }

  /**
   * Closes the Dismissable by removing the open class from the element and setting a timer to remove the element from
   * the DOM.
   */
  close() {
    this.element.addClass('closed');
    setTimeout(function() {
      this.element.removeFromDOM();
    }.bind(this), this.options.closeTimeout);
  }

  /**
   * Destroys the widget.
   */
  destroy() {
    this.dismissButton.removeEventListener('click', this._handleClick);
  }

  /**
   * Initializes the Dismissable by binding the events to the dismiss button.
   *
   * @returns {Dismissable} This.
   */
  initialize() {
    this.dismissButton.addEventListener('click', this._handleClick);
    return this;
  }

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {Dismissable} This.
   */
  withCloseTimeout(timeout) {
    this.options.closeTimeout = timeout;
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Dismissable} This.
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

  /**
   * Handles the click event.
   * @private
   */
  _handleClick(event) {
    Utils.stopEvent(event);
    this.close();
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      closeTimeout: 400
    };
  }
}

export {Dismissable}

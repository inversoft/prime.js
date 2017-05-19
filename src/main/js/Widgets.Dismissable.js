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

var Prime = Prime || {};

/**
 * The Prime.Widgets namespace.
 *
 * @namespace Prime.Widgets
 */
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new Dismissable object for the given element.
 *
 * @param {Prime.Document.Element|Element|EventTarget} element The Element for the Dismissable widget.
 * @param {Prime.Document.Element|Element|EventTarget} dismissButton The Element for the Dismissable button.
 * @constructor
 */
Prime.Widgets.Dismissable = function(element, dismissButton) {
  this.element = Prime.Document.Element.wrap(element);
  this.dismissButton = dismissButton;
  Prime.Utils.bindAll(this);
  this._setInitialOptions();
};

Prime.Widgets.Dismissable.constructor = Prime.Widgets.Dismissable;

Prime.Widgets.Dismissable.prototype = {
  /**
   * Closes the Dismissable by removing the open class from the element and setting a timer to remove the element from
   * the DOM.
   */
  close: function() {
    this.element.removeClass('open');
    setTimeout(function() {
      this.element.removeFromDOM();
    }.bind(this), this.options['closeTimeout']);
  },

  /**
   * Initializes the Dismissable by binding the events to the dismiss button.
   */
  initialize: function() {
    this.dismissButton.addEventListener('click', this._handleClick);
  },

  /**
   * Sets the timeout used in the close method to allow for transitions.
   *
   * @param timeout {int} The timeout.
   * @returns {Prime.Widgets.Dismissable} This.
   */
  withCloseTimeout: function(timeout) {
    this.options['closeTimeout'] = timeout;
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.Dismissable} This.
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

  /**
   * Handles the click event.
   * @private
   */
  _handleClick: function(event) {
    this.close();
    Prime.Utils.stopEvent(event);
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'closeTimeout': 400
    };
  }
};

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
 * Constructs a new Tooltip object for the given element.
 *
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element for the Tooltip widget.
 * @constructor
 */
Prime.Widgets.Tooltip = function(element) {
  Prime.Utils.bindAll(this);

  this.element = Prime.Document.Element.wrap(element);
  this._setInitialOptions();
};

Prime.Widgets.Tooltip.constructor = Prime.Widgets.Tooltip;

Prime.Widgets.Tooltip.prototype = {
  /**
   * Hides the tooltip.
   *
   * @returns {Prime.Widgets.Tooltip} This.
   */
  hide: function() {
    if (this.element.domElement.tooltip) {
      this.element.domElement.tooltip.removeFromDOM();
    }
    return this;
  },

  /**
   * Initializes the widget by attaching event listeners to the element.
   *
   * @returns {Prime.Widgets.Tooltip} This.
   */
  initialize: function() {
    this.element.addEventListener('mouseenter', this._handleMouseEnter)
        .addEventListener('mouseleave', this._handleMouseLeave);
    return this;
  },

  /**
   * Shows the tooltip.
   *
   * @returns {Prime.Widgets.Tooltip} This.
   */
  show: function() {
    var text = this.element.getDataSet()[this.options.dataName];
    var zIndex = this.element.getRelativeZIndex();
    var tooltip = Prime.Document.newElement('<span>')
        .appendTo(Prime.Document.bodyElement)
        .addClass(this.options.className + ' ' + this.element.getTagName().toLowerCase())
        .setHTML(text)
        .setStyle('zIndex', zIndex + 10);

    var coords = this.element.getCoordinates();
    var targetWidth = this.element.getWidth();
    var tooltipHeight = tooltip.getHeight();
    var tooltipWidth = tooltip.getWidth();
    var textAlign = this.element.getComputedStyle()['textAlign'];
    if (textAlign === 'right') {
      tooltip.setLeft(coords.left + (targetWidth - 5) - (tooltipWidth / 2));
      tooltip.setTop(coords.top - tooltipHeight - 6);
    } else if (targetWidth > tooltipWidth && (textAlign === 'left' || textAlign === 'start')) {
      var left = coords.left - (tooltipWidth / 2);
      tooltip.setLeft(left < 5 ? 5 : left);
      tooltip.setTop(coords.top - tooltipHeight - 6);
    } else {
      tooltip.setLeft(coords.left + (targetWidth / 2) - (tooltipWidth / 2));
      tooltip.setTop(coords.top - tooltipHeight - 6);
    }

    this.element.domElement.tooltip = tooltip;
    return this;
  },

  /**
   * Sets the class name to use when creating the tooltip.
   *
   * @param className {String} The class name.
   * @returns {Prime.Widgets.Tooltip} This.
   */
  withClassName: function(className) {
    this.options.className = className;
    return this;
  },

  /**
   * Set data-set name to pull the tooltip text from.
   *
   * @param {string} name The data-set name.
   * @returns {Prime.Widgets.Tooltip} This.
   */
  withDataName: function(name) {
    this.options.dataName = name;
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.Tooltip} This.
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
   * Handles the mouse enter event to show the tooltip.
   *
   * @private
   */
  _handleMouseEnter: function() {
    this.show();
  },

  /**
   * Handles the mouse exit event to hide the tooltip.
   *
   * @private
   */
  _handleMouseLeave: function() {
    this.hide();
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'className': 'prime-tooltip',
      'dataName': 'tooltip'
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.element);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};

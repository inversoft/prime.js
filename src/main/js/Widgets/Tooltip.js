/*
 * Copyright (c) 2017-2018, Inversoft Inc., All Rights Reserved
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

import {PrimeDocument} from "../PrimeDocument";
import {PrimeElement} from "../Document/PrimeElement";
import {PrimeWindow} from "../Window";
import {Utils} from "../Utils";

const open = [];

class Tooltip {
  /**
   * Constructs a new Tooltip object for the given element.
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element for the Tooltip widget.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    this._setInitialOptions();
  }

  static get open() {
    return open;
  }

  /**
   * Hides the tooltip.
   *
   * @returns {Tooltip} This.
   */
  hide() {
    if (Tooltip.open.length > 0) {
      Tooltip.open.forEach(function(t) {
        t.removeFromDOM();
      });
    }
    return this;
  }

  /**
   * Initializes the widget by attaching event listeners to the element.
   *
   * @returns {Tooltip} This.
   */
  initialize() {
    this.element.addEventListener('mouseenter', this._handleMouseEnter).addEventListener('mouseleave', this._handleMouseLeave);
    PrimeDocument.addEventListener('scroll', this._handleMouseLeave);
    return this;
  }

  /**
   * Shows the tooltip.
   *
   * @returns {Tooltip} This.
   */
  show() {
    const text = this.element.getDataSet()[this.options.dataName];
    const zIndex = this.element.getRelativeZIndex();
    const tooltip = PrimeDocument.newElement('<span>')
        .appendTo(PrimeDocument.bodyElement)
        .addClass(this.options.className + ' ' + this.element.getTagName().toLowerCase())
        .setHTML(text)
        .setStyle('zIndex', zIndex + 10);

    const left = this.element.getLeft();
    const top = this.element.getTop();
    const width = this.element.getWidth();
    const tooltipWidth = tooltip.getWidth();
    const tooltipHeight = tooltip.getHeight();

    tooltip.setLeft(left - (tooltipWidth / 2) + (width / 2));
    tooltip.setTop(top - tooltipHeight - 8);

    // If the tooltip is too close to the top of the screen invert it and move it under the element
    if ((top - tooltipHeight - 8) < 0) {
      tooltip.setTop(top + this.element.getHeight() + 8).addClass('inverted');
    }

    Tooltip.open.push(tooltip);
    return this;
  }

  /**
   * Sets the class name to use when creating the tooltip.
   *
   * @param className {String} The class name.
   * @returns {Tooltip} This.
   */
  withClassName(className) {
    this.options.className = className;
    return this;
  }

  /**
   * Set data-set name to pull the tooltip text from.
   *
   * @param {string} name The data-set name.
   * @returns {Tooltip} This.
   */
  withDataName(name) {
    this.options.dataName = name;
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Tooltip} This.
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
   * Handles the mouse enter event to show the tooltip.
   *
   * @private
   */
  _handleMouseEnter() {
    this.show();
  }

  /**
   * Handles the mouse exit event to hide the tooltip.
   *
   * @private
   */
  _handleMouseLeave() {
    this.hide();
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      className: 'prime-tooltip',
      dataName: 'tooltip'
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

PrimeDocument.onReady(function() {
  // Fix browser issues with tooltips sticking around on back-button navigation
  PrimeWindow.addEventListener('beforeunload', function() {
    if (Tooltip.open.length > 0) {
      Tooltip.open.forEach(function(t) {
        t.removeFromDOM();
      });
    }
  });
});

export {Tooltip};

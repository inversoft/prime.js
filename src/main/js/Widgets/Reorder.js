/*
 * Copyright (c) 2020, Inversoft Inc., All Rights Reserved
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

class Reorder {
  /**
   * Constructs a new Reorder object for the given element.
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element for containing the re-orderable items.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    this._setInitialOptions();
  }

  /**
   * Destroy this widget.
   *
   * @returns {Reorder} This.
   */
  destroy() {
    this.element.removeEventListener('click', this._handleMoveDownClick);
    this.element.removeEventListener('click', this._handleMoveUpClick);
    return this;
  }

  /**
   * Initializes the widget by attaching event listeners to the element.
   *
   * @returns {Reorder} This.
   */
  initialize() {
    this.element.addDelegatedEventListener('click', this.options.moveDownSelector, this._handleMoveDownClick);
    this.element.addDelegatedEventListener('click', this.options.moveUpSelector, this._handleMoveUpClick);

    this._refreshButtonStates();
    return this;
  }

  /**
   * Move the item down.
   *
   * @param item {PrimeElement|Element} the item to move.
   * @returns {Reorder} This.
   */
  moveDown(item) {
    if (item !== null) {
      item.getNextSibling().insertBefore(item);
    }

    this._refreshButtonStates();

    if (this.options.reorderCallback) {
      this.options.reorderCallback(this, item);
    }

    return this;
  }

  /**
   * Move the item up.
   *
   * @param item {PrimeElement|Element} the item to move.
   * @returns {Reorder} This.
   */
  moveUp(item) {
    if (item !== null) {
      item.getPreviousSibling().insertAfter(item);
    }

    this._refreshButtonStates();

    if (this.options.reorderCallback) {
      this.options.reorderCallback(this, item);
    }

    return this;
  }

  /**
   * Sets the selector which is used to identify the re-orderable items in the container.
   *
   * @param itemSelector {String} The item selector.
   * @returns {Reorder} This.
   */
  withItemSelector(itemSelector) {
    this.options.itemSelector = itemSelector;
    return this;
  }

  /**
   * Sets the selector which is used to identify the move down button within the re-orderable item.
   *
   * @param moveDownSelector {String} The move down button selector.
   * @returns {Reorder} This.
   */
  withDownSelector(moveDownSelector) {
    this.options.moveDownSelector = moveDownSelector;
    return this;
  }

  /**
   * Sets the selector which is used to identify the move up button within the re-orderable item.
   *
   * @param moveUpSelector {String} The move up button selector.
   * @returns {Reorder} This.
   */
  withMoveUpSelector(moveUpSelector) {
    this.options.moveUpSelector = moveUpSelector;
    return this;
  }

  /**
   * Sets a callback function to be used after an element changes order.
   *
   * @param reorderCallback {function} The optional callback function to call after an element changes order. This
   *        function will be provided with the item that just moved.
   * @returns {Reorder} This.
   */
  withReorderCallback(reorderCallback) {
    this.options.reorderCallback = reorderCallback;
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Reorder} This.
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
   * Redraw the state of this widget. This may be called if you have added additional items to be re-ordered.
   *
   * @returns {Reorder} This.
   */
  redraw() {
    this._refreshButtonStates();
    return this;
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handle the Move Down click event.
   *
   * @param {Event} event The event.
   * @private
   */
  _handleMoveDownClick(event) {
    Utils.stopEvent(event);

    const target = new PrimeElement(event.target);
    const item = target.queryUp(this.options.itemSelector);
    this.moveDown(item);
  }

  /**
   * Handle the Move Up click event.
   *
   * @param {Event} event The event.
   * @private
   */
  _handleMoveUpClick(event) {
    Utils.stopEvent(event);

    const target = new PrimeElement(event.target);
    const item = target.queryUp(this.options.itemSelector);
    this.moveUp(item);
  }

  /**
   * Handle a 'refresh' to ensure the buttons are in the correct state.
   * @private
   */
  _refreshButtonStates() {
    const items = this.element.query(this.options.itemSelector);
    if (items.length === 0) {
      return;
    }

    if (items.length === 1) {
      // Only one item, all buttons are disabled
      items[0].queryFirst(this.options.moveDownSelector).addClass('disabled');
      items[0].queryFirst(this.options.moveUpSelector).addClass('disabled');
      items[0].setDataAttribute('index', 0);
      return;
    }

    // More than one item
    items.each(function(element, index) {
      if (index === 0) {
        // First element
        element.queryFirst(this.options.moveUpSelector).addClass('disabled');
        element.queryFirst(this.options.moveDownSelector).removeClass('disabled');
      } else if (index === (items.length - 1)) {
        // Last element
        element.queryFirst(this.options.moveUpSelector).removeClass('disabled');
        element.queryFirst(this.options.moveDownSelector).addClass('disabled');
      } else {
        // Enable these up and down buttons
        element.queryFirst(this.options.moveDownSelector).removeClass('disabled');
        element.queryFirst(this.options.moveUpSelector).removeClass('disabled');
      }

      // Set the index data attribute
      element.setDataAttribute('index', index);
    }.bind(this));
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      itemSelector: 'data-item',
      moveDownSelector: 'a.down',
      moveUpSelector: 'a.up',
      reorderCallback: null
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {Reorder};

/*
 * Copyright (c) 2014-2017, Inversoft Inc., All Rights Reserved
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
import {PrimeStorage} from "../Storage.js";
import {PrimeDocument} from "../PrimeDocument.js";

class SplitButton {
  /**
   * Constructs a new SplitButton object for the given element.
   *
   * The markup must be a specific structure in order for the SplitButton to remember the last action the user took
   * as well as show and hide the menu of items.
   *
   * Here's the format for the elements.
   *
   * <pre>
   *   &lt;div class="split-button"&gt;
   *     &lt;a href="#"&gt;Loading... &lt;/a&gt;
   *     &lt;button type="button"&gt;&lt;/button&gt;
   *     &lt;div type="menu"&gt;
   *       &lt;a class="item" href="/admin/foo/add/"&gt;Add&lt;/a&gt;
   *       &lt;a class="item" href="/admin/foo/delete/"&gt;Delete&lt;/a&gt;
   *     &lt;/div&gt;
   *   &lt;/ul&gt;
   * </pre>
   *
   * Also, it is important to understand how to attach event listeners to the SplitButton. You cannot attach them to
   * the individual menu items since those will never be clicked. Instead, you must attach them to the div at the top
   * and handle all the events from inside. This is due to how the split button changes the main button based on the
   * action the user took last.
   *
   * @param element {PrimeElement|Element|EventTarget} The element to transform into a split button.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    this.currentAction = this.element.queryFirst('a');
    if (this.currentAction === null) {
      throw new TypeError('The SplitButton element must contain an <a> that is the currently selected action.');
    }
    this.loading = this.currentAction;

    this.button = this.element.queryFirst('button');
    if (this.button === null) {
      throw new TypeError('The SplitButton element must contain a <button> that is used to open it.');
    }

    this.menu = this.element.queryFirst('.menu');
    if (this.menu === null) {
      throw new TypeError('The SplitButton element must contain a <div class="menu"> that contains the menu items.');
    }

    this.items = this.menu.query('.item');
    if (this.items.length === 0) {
      throw new TypeError('The SplitButton element must contain at least one item.');
    }

    this.actionIndex = null;
    this.options = {};
    this._setInitialOptions();
  }

  /**
   * Removes the event listeners.
   */
  destroy() {
    this.button.removeEventListener('click', this._handleButtonClick);
  }

  /**
   * Initializes the SplitButton by setting up all the event listeners and managing the default action or the last action
   * that the user took.
   */
  initialize() {
    this.button.addEventListener('click', this._handleButtonClick);
    this.items.each(item => item.addEventListener('click', this._handleItemClick));
    this.redraw();
    return this;
  }

  redraw() {
    // Load the last action (if any)
    let actionId = null;
    if (PrimeStorage.supported && this.options.localStorageKey !== null) {
      actionId = PrimeStorage.getSessionObject(this.options.localStorageKey);
      if (actionId !== null) {
        this.selectAction(actionId);
      }
    }

    // If no action is selected from local storage, select the default
    if (actionId === null) {
      this.selectDefaultAction();
    }

    return this;
  }

  selectAction(actionId) {
    const item = PrimeDocument.queryById(actionId);
    if (item !== null) {
      let classes = '';
      if (this.loading !== null) {
        classes = this.loading.getAttribute('class');
        this.loading.removeFromDOM();
        this.loading = null;
      } else {
        classes = this.currentAction.getAttribute('class');
        this.currentAction.setAttribute('class', this.currentAction.getAttribute('data-original-class'));
        this.currentAction.removeFromDOM();
        this.currentAction.prependTo(this.menu);
      }

      item.setAttribute('data-original-class', item.getAttribute('class'));
      item.setAttribute('class', classes);
      item.removeFromDOM();
      item.prependTo(this.element);
      this.currentAction = item;
    } else {
      // This shouldn't infinitely recurse because that method always finds something
      this.selectDefaultAction();
    }

    // this.currentAction.setAttribute('href', item.getAttribute('href'));
    // this.currentAction.setHTML(item.getHTML());
    return this;
  }

  selectDefaultAction() {
    // Find the default
    let actionId = null;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].hasClass('default')) {
        actionId = this.items[i].getId();
        break;
      }
    }

    // Fall back if it wasn't found
    if (actionId === null) {
      actionId = this.items[0].getId();
    }

    // Select the default (or first item)
    if (actionId !== null) {
      this._saveLastAction(actionId);
      this.selectAction(actionId);
    }

    return this;
  }

  withLocalStorageKey(localStorageKey) {
    this.options.localStorageKey = localStorageKey;
    return this;
  }

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
   * Handles the button click event.
   * @private
   */
  _handleButtonClick(event) {
    Utils.stopEvent(event);
    if (this.menu.isVisible()) {
      this.menu.hide();
    } else {
      this.menu.show();
    }
  }

  /**
   * Handles the item click event to update the last action in local storage (if enabled).
   * @private
   */
  _handleItemClick(event) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].domElement === event.target) {
        let actionId = this.items[i].getId();
        this._saveLastAction(actionId);
        this.selectAction(actionId);
        this.menu.hide();
        break;
      }
    }
  }

  _saveLastAction(actionId) {
    if (PrimeStorage.supported && this.options.localStorageKey !== null) {
      PrimeStorage.setSessionObject(this.options.localStorageKey, actionId);
    }
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      localStorageKey: null
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {SplitButton};

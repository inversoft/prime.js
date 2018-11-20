/*
 * Copyright (c) 2015-2017, Inversoft Inc., All Rights Reserved
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

import {PrimeDocument} from "../PrimeDocument.js";
import {PrimeElement} from "../Document/PrimeElement.js";
import {Touchable} from "./Touchable.js";
import {Utils} from "../Utils.js";

class SideMenu {
  /**
   * Constructs the side menu.
   *
   * @param {PrimeElement|Element} button The button element that is used to open the side menu.
   * @param {PrimeElement|Element} sideMenuElement The side menu element that will be "hidden" and "show".
   * @constructor
   */
  constructor(button, sideMenuElement) {
    Utils.bindAll(this);
    this.sideMenu = PrimeElement.wrap(sideMenuElement);
    this.button = PrimeElement.wrap(button);
    this._setInitialOptions();
  }

  /**
   * Closes the side menu.
   *
   * @returns {SideMenu} This.
   */
  close() {
    if (!PrimeDocument.bodyElement.hasClass(this.options.closedClass)) {
      PrimeDocument.bodyElement.addClass(this.options.closedClass);
    }

    if (PrimeDocument.bodyElement.hasClass(this.options.openClass)) {
      PrimeDocument.bodyElement.removeClass(this.options.openClass);
    }

    return this;
  }

  /**
   * Initializes the widget by attaching the event listener to the menu button.
   *
   * @returns {SideMenu}
   */
  initialize() {
    this.button.addEventListener('click', this._handleClickEvent);
    return this;
  }

  /**
   * @returns {boolean} True if the side menu is currently open.
   */
  isOpen() {
    return this.sideMenu.getLeft() >= 0;
    // return PrimeDocument.bodyElement.hasClass('prime-side-menu-open') || !PrimeDocument.bodyElement.hasClass('prime-side-menu-closed');
  }

  /**
   * Opens the mobile nav.
   * @returns {SideMenu} This.
   */
  open() {
    if (PrimeDocument.bodyElement.hasClass(this.options.closedClass)) {
      PrimeDocument.bodyElement.removeClass(this.options.closedClass);
    }

    if (!PrimeDocument.bodyElement.hasClass(this.options.openClass)) {
      PrimeDocument.bodyElement.addClass(this.options.openClass);
    }

    this.touchable = new Touchable(PrimeDocument.bodyElement).withSwipeLeftHandler(this._handleSwipeLeft);
    return this;
  }

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {SideMenu} This.
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
   * Handles the click event on the side menu button and calls either the open or close function.
   *
   * @private
   */
  _handleClickEvent(event) {
    Utils.stopEvent(event);
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handles the synthetic swipe left event that Prime.js provides.
   *
   * @private
   */
  _handleSwipeLeft() {
    if (this.isOpen()) {
      this.close();
    }

    if (Utils.isDefined(this.touchable)) {
      this.touchable.destroy();
      this.touchable = null;
    }
  }

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      closedClass: 'prime-side-menu-closed',
      openClass: 'prime-side-menu-open'
    };

    const userOptions = Utils.dataSetToOptions(this.sideMenu);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {SideMenu}

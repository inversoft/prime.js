/*
 * Copyright (c) 2015-2016, Inversoft Inc., All Rights Reserved
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
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs the side menu.
 *
 * @param {Prime.Document.Element|Element} button The button element that is used to open the side menu.
 * @param {Prime.Document.Element|Element} sideMenuElement The side menu element that will be "hidden" and "show".
 * @constructor
 */
Prime.Widgets.SideMenu = function(button, sideMenuElement) {
  Prime.Utils.bindAll(this);
  Prime.Document.Element.wrap(button).addEventListener('click', this._handleClickEvent);
  this.sideMenu = Prime.Document.Element.wrap(sideMenuElement);
  this._setInitialOptions();
};

Prime.Widgets.SideMenu.constructor = Prime.Widgets.SideMenu;

Prime.Widgets.SideMenu.prototype = {
  /**
   * Closes the side menu.
   * @returns {Prime.Widgets.SideMenu} This.
   */
  close: function() {
    if (!Prime.Document.bodyElement.hasClass(this.options['closedClass'])) {
      Prime.Document.bodyElement.addClass(this.options['closedClass']);
    }

    if (Prime.Document.bodyElement.hasClass(this.options['openClass'])) {
      Prime.Document.bodyElement.removeClass(this.options['openClass']);
    }

    return this;
  },

  /**
   * @returns {boolean} True if the side menu is currently open.
   */
  isOpen: function() {
    return this.sideMenu.getLeft() >= 0;
    // return Prime.Document.bodyElement.hasClass('prime-side-menu-open') || !Prime.Document.bodyElement.hasClass('prime-side-menu-closed');
  },

  /**
   * Opens the mobile nav.
   * @returns {Prime.Widgets.SideMenu} This.
   */
  open: function() {
    if (Prime.Document.bodyElement.hasClass(this.options['closedClass'])) {
      Prime.Document.bodyElement.removeClass(this.options['closedClass']);
    }

    if (!Prime.Document.bodyElement.hasClass(this.options['openClass'])) {
      Prime.Document.bodyElement.addClass(this.options['openClass']);
    }

    this.touchable = new Prime.Widgets.Touchable(Prime.Document.bodyElement).withSwipeLeftHandler(this._handleSwipeLeft);
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.SideMenu} This.
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
   * Handles the click event on the side menu button and calls either the open or close function.
   *
   * @private
   */
  _handleClickEvent: function(event) {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
    Prime.Utils.stopEvent(event);
  },

  /**
   * Handles the synthetic swipe left event that Prime.js provides.
   *
   * @private
   */
  _handleSwipeLeft: function() {
    if (this.isOpen()) {
      this.close();
    }

    if (Prime.Utils.isDefined(this.touchable)) {
      this.touchable.destroy();
      this.touchable = null;
    }
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'closedClass': 'prime-side-menu-closed',
      'openClass': 'prime-side-menu-open'
    };

    var userOptions = Prime.Utils.dataSetToOptions(this.sideMenu);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};
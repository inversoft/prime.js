/*
 * Copyright (c) 2015, Inversoft Inc., All Rights Reserved
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
 * Constructs a new SideMenu widget.
 *
 * @param element {Prime.Document.Element|Element|EventTarget} The menu element
 * @constructor
 */
Prime.Widgets.SideMenu = function(element) {
  Prime.Utils.bindAll(this);

  // Add the Open Button to the element
  this.element = Prime.Document.Element.wrap(element);
  this._setInitialOptions();

  this.body = new Prime.Document.Element(document.body);
  this.body.queryFirst('.prime-side-menu-button').addEventListener('click', this._handleClick, this);
};

Prime.Widgets.SideMenu.MENU_CHARACTER = '&#9776;';

Prime.Widgets.SideMenu.constructor = Prime.Widgets.SideMenu;

Prime.Widgets.SideMenu.prototype = {

  /**
   * Open the menu
   * @returns {Prime.Widgets.SideMenu}
   */
  close: function() {
    this.body.removeClass('prime-side-menu-active');
    return this;
  },

  /**
   * Open the menu
   * @returns {Prime.Widgets.SideMenu}
   */
  open: function() {
    this.body.addClass('prime-side-menu-active');
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.SideMenu}
   */
  withOptions: function(options) {
    if (typeof options === 'undefined' || options === null) {
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
   * Handle the open click event.
   *
   * @private
   */
  _handleClick: function() {
    if (this.body.hasClass('prime-side-menu-active')) {
      this.close();
    } else {
      this.open();
    }
    Prime.Utils.stopEvent(event);
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {};

    var userOptions = Prime.Utils.dataSetToOptions(this.element);
    for (var option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
};
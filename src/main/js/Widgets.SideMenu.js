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
var Prime = Prime || {};
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new SideMenu widget.
 *
 * @param element {Prime.Document.Element} The menu element
 * @constructor
 */
Prime.Widgets.SideMenu = function(element) {

  // Add the Open Button to the element
  this.element = element;
  this.element.addClass('prime-side-menu');
  this.element.insertHTMLAfterBegin('<div class="prime-side-menu-button prime-menu-open">' + Prime.Widgets.SideMenu.MENU_CHARACTER + '</div>');

  // Setup initial options
  this._setInitialOptions();

  // Wrap the ul and then move to the end of the body.
  var menu = this.element.queryFirst('ul');
  this.menu = Prime.Document.move(menu, document.body);
  this.menu.wrapInnerHTML('<div>', {'class': 'prime-side-menu-list'});
  // Update the reference to the menu
  this.menu = Prime.Document.queryLast('.prime-side-menu-list');
  this.menu.insertHTMLAfterBegin('<div class="prime-side-menu-button prime-menu-close">' + Prime.Widgets.SideMenu.MENU_CHARACTER + '</div>');
  this.menu.addClass('prime-side-menu-list');

  // Set references and add click handlers
  this.openButton = this.element.queryFirst('.prime-side-menu-button.prime-menu-open').addEventListener('click', this._handleOpenClick, this);
  this.closeButton = this.menu.queryFirst('.prime-side-menu-button.prime-menu-close').addEventListener('click', this._handleCloseClick, this);
};

Prime.Widgets.SideMenu.MENU_CHARACTER = '&#9776;';

Prime.Widgets.SideMenu.constructor = Prime.Widgets.SideMenu;

Prime.Widgets.SideMenu.prototype = {

  /**
   * Close the menu
   * @returns {Prime.Widgets.SideMenu}
   */
  close: function() {
    this.menu.removeClass('prime-menu-open');
    return this;
  },

  /**
   * Open the menu
   * @returns {Prime.Widgets.SideMenu}
   */
  open: function() {
    this.menu.setLeft(this.openButton.getLeft());
    this.menu.addClass('prime-menu-open');
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
   * Handle the close click event.
   *
   * @private
   */
  _handleCloseClick: function() {
    this.close();
    return false;
  },

  /**
   * Handle the open click event.
   *
   * @private
   */
  _handleOpenClick: function() {
    this.open();
    return false;
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
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
 * Constructs the side menu.
 *
 * @param {Prime.Document.Element|Element} button The button element that is used to open the side menu.
 * @param {Prime.Document.Element|Element} mainBody The main body element of the page. This should be after the side
 * menu element in the DOM and contain the entire page (but not the &lt;body> element).
 * @constructor
 */
Prime.Widgets.SideMenu = function(button, mainBody) {
  Prime.Utils.bindAll(this);

  this.body = new Prime.Document.Element(document.body);
  Prime.Document.Element.wrap(button).addEventListener('click', this._handleClickEvent);

  Prime.Document.Element.wrap(mainBody).addClass('prime-side-menu-body');
};

Prime.Widgets.SideMenu.constructor = Prime.Widgets.SideMenu;

Prime.Widgets.SideMenu.prototype = {
  /**
   * Creates a side menu by copying an existing side menu into a new element that is the first child under the &lt;body>
   * element.
   *
   * @param {Prime.Document.Element} element The existing menu element to copy into a new side menu.
   */
  copyFromElement: function(element) {
    var sideMenu = Prime.Document.newElement('<nav/>')
        .prependTo(this.body)
        .setId('prime-side-menu')
        .addClass('prime-side-menu')
        .setHTML(element.getHTML());
    sideMenu.query('a').each(function(e) {
      e.addEventListener('click', this._handleTOCClickEvent);
    }.bind(this));
  },

  /**
   * Closes the side menu.
   */
  close: function() {
    this.body.removeClass('prime-side-menu-open');
  },

  /**
   * @returns {boolean} True if the side menu is currently open.
   */
  isOpen: function() {
    return this.body.hasClass('prime-side-menu-open');
  },

  /**
   * Opens the mobile nav.
   */
  open: function() {
    this.body.addClass('prime-side-menu-open');
    this.touchable = new Prime.Widgets.Touchable(this.body).withSwipeLeftHandler(this._handleSwipeLeft);
  },

  /**
   * Sets this SideMenu to use the given element. You can also call copyFromElement to setup the side menu.
   *
   * @param {Prime.Document.Element|Element} sideMenuElement The existing side menu element.
   */
  usingSideMenuElement: function(sideMenuElement) {
    sideMenuElement = Prime.Document.Element.wrap(sideMenuElement);
    sideMenuElement.query('a').each(function(e) {
      e.addEventListener('click', this._handleTOCClickEvent);
    }.bind(this));
  },

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
   * Handles the click event on a mobile link.
   *
   * @private
   */
  _handleTOCClickEvent: function() {
    this.close();
  }
};
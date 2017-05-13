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
  Prime.Utils.bindAll(this);
  dismissButton.addEventListener('click', this._handleClick);
};

Prime.Widgets.Dismissable.constructor = Prime.Widgets.Dismissable;

Prime.Widgets.Dismissable.prototype = {
  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handles the click event.
   * @private
   */
  _handleClick: function(event) {
    this.element.setOpacity(0);
    setTimeout(function() {
      this.element.removeFromDOM();
    }.bind(this), 400);
    Prime.Utils.stopEvent(event);
  }
};

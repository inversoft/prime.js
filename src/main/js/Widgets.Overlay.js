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
var Prime = Prime || {};
Prime.Widgets = Prime.Widgets || {};


/**
 * Constructs a new Overlay instance once per DOM.
 *
 * @constructor
 */
Prime.Widgets.Overlay = function() {
  Prime.Utils.bindAll(this);

  // Check if the overlay doesn't exist and add it
  this.overlay = Prime.Document.queryById('prime-overlay');
  if (this.overlay === null) {
    this.overlay = Prime.Document.newElement('<div/>').setId('prime-overlay').appendTo(document.body).hide();
  }
};

/**
 * The singleton instance.
 *
 * @type {Prime.Widgets.Overlay}
 */
Prime.Widgets.Overlay.instance = null;

Prime.Widgets.Overlay.prototype = {
  /**
   * Closes the overlay and the target element.
   */
  close: function() {
    Prime.Document.bodyElement.setStyle('overflow', 'scroll');
    this.overlay.setStyle('zIndex', '10');
    this.overlay.hide();
    return this;
  },

  /**
   * Opens the overlay and positions the element over it.
   */
  open: function(zindex) {
    Prime.Document.bodyElement.setStyle('overflow', 'hidden');
    this.overlay.show();

    // Set the z-index of this dialog and the overlay
    this.overlay.setStyle('zIndex', zindex.toString());
    return this;
  },

  /**
   * Changes the id of the Overlay element.
   *
   * @param id {string} The new id.
   * @returns {Prime.Widgets.Overlay}
   */
  setId: function(id) {
    this.overlay.setId(id);
    return this;
  },

  /**
   * Updates the zindex of the overlay.
   *
   * @param zindex {string|number} The new zindex.
   */
  setZIndex: function(zindex) {
    this.overlay.setStyle('zIndex', zindex.toString());
    return this;
  }
};

Prime.Document.onReady(function() {
  Prime.Widgets.Overlay.instance = new Prime.Widgets.Overlay();
});

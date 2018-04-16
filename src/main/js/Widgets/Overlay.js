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

import {Utils} from "../Utils";
import {PrimeDocument} from "../PrimeDocument";

/**
 * The singleton instance.
 *
 * @type {Overlay}
 */
let instance;

class Overlay {
  /**
   * Constructs a new Overlay instance once per DOM.
   *
   * @constructor
   */
  constructor() {
    Utils.bindAll(this);

    // Check if the overlay doesn't exist and add it
    this.overlay = PrimeDocument.queryById('prime-overlay');
    if (this.overlay === null) {
      this.overlay = PrimeDocument.newElement('<div/>').setId('prime-overlay').appendTo(document.body).hide();
    }
    this.bodyOverflow = null;
  }

  /**
   * Return the instance of the Overlay widget
   * @returns {Overlay}
   */
  static get instance() {
    return instance;
  }

  /**
   * Set the instance value of the Overlay instance
   * @param  value {Overlay}
   */
  static set instance(value) {
    instance = value;
  }

  /**
   * Closes the overlay and the target element.
   */
  close() {
    // using null ensures that if this style is not defined, we'll remove it when we're done
    let overflowStyle = this.bodyOverflow || '';
    PrimeDocument.bodyElement.setStyle('overflow', overflowStyle);
    this.overlay.setStyle('zIndex', '10');
    this.overlay.hide();
    return this;
  }

  /**
   * Opens the overlay and positions the element over it.
   * @param zIndex {Number|string}
   */
  open(zIndex) {
    if (this.bodyOverflow === null) {
      this.bodyOverflow = PrimeDocument.bodyElement.getStyle('overflow');
    }
    PrimeDocument.bodyElement.setStyle('overflow', 'hidden');
    this.overlay.show();

    // Set the z-index of this dialog and the overlay
    this.overlay.setStyle('zIndex', zIndex.toString());
    return this;
  }

  /**
   * Changes the id of the Overlay element.
   *
   * @param id {string} The new id.
   * @returns {Overlay}
   */
  setId(id) {
    this.overlay.setId(id);
    return this;
  }

  /**
   * Updates the zindex of the overlay.
   *
   * @param zIndex {string|number} The new zIndex.
   */
  setZIndex(zIndex) {
    this.overlay.setStyle('zIndex', zIndex.toString());
    return this;
  }
}

PrimeDocument.onReady(function() {
  Overlay.instance = new Overlay();
});

export {Overlay};

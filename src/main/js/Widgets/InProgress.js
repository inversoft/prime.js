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

import {PrimeDocument} from "../PrimeDocument";
import {PrimeElement} from "../Document/PrimeElement";
import {Utils} from "../Utils";

class InProgress {
  /**
   * Constructs a In Progress widget that opens an overlay over an element while something is running and closes it when
   * it finishes.
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element to overlay.
   * @constructor
   */
  constructor(element) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    this._setInitialOptions();
    this.draggable = null;
  }

  /**
   * Closes the InProgress process.
   *
   * @param {Function} callback (Optional) A callback function to invoke after the InProgress has been completely closed.
   */
  close(callback) {
    try {
      this.options.endFunction(this);
    } finally {
      const now = new Date().getTime();
      const duration = now - this.startInstant;
      if (duration < this.options.minimumTime) {
        setTimeout(function() {
          this.overlay.removeFromDOM();

          if (callback) {
            callback();
          }
        }.bind(this), this.options.minimumTime - duration);
      } else {
        this.overlay.removeFromDOM();

        if (callback) {
          callback();
        }
      }
    }

    return this;
  }

  /**
   * Opens the InProgress process.
   */
  open() {
    this.startInstant = new Date().getTime();
    this.overlay = PrimeDocument.newElement('<div/>').setId('prime-in-progress-overlay').appendTo(document.body);
    PrimeDocument.newElement('<i/>', {class: 'fa fa-spin fa-' + this.options.iconName}).appendTo(this.overlay);

    const coords = this.element.getCoordinates();
    const bodyCoords = PrimeDocument.bodyElement.getCoordinates();
    this.overlay.setTop(coords.top - bodyCoords.top);
    this.overlay.setLeft(coords.left - bodyCoords.left);
    this.overlay.setWidth(this.element.getBorderedWidth());
    this.overlay.setHeight(this.element.getBorderedHeight());
    this.overlay.setStyle('zIndex', (this.element.getRelativeZIndex() + 1000).toString());

    this.options.startFunction(this);

    return this;
  }

  /**
   * Sets the end function that is called when the InProgress process is finished.
   *
   * @param f {function} The function.
   * @returns {InProgress} This.
   */
  withEndFunction(f) {
    this.options.endFunction = f;
    return this;
  }

  /**
   * Sets the FontAwesome icon name to use for the overlay.
   *
   * @param iconName {string} The icon name.
   * @returns {InProgress} This.
   */
  withIconName(iconName) {
    this.options.iconName = iconName;
    return this;
  }

  /**
   * Sets the minimum time that the InProgress process must run.
   *
   * @param time {number} The time in milliseconds.
   * @returns {InProgress} This.
   */
  withMinimumTime(time) {
    this.options.minimumTime = time;
    return this;
  }

  /**
   * Sets the start function that is called when the InProgress process is started.
   *
   * @param f {function} The function.
   * @returns {InProgress} This.
   */
  withStartFunction(f) {
    this.options.startFunction = f;
    return this;
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions() {
    // Defaults
    this.options = {
      endFunction: function() {
      },
      iconName: 'refresh',
      minimumTime: 1000,
      startFunction: function() {
      }
    };

    const userOptions = Utils.dataSetToOptions(this.element);
    for (let option in userOptions) {
      if (userOptions.hasOwnProperty(option)) {
        this.options[option] = userOptions[option];
      }
    }
  }
}

export {InProgress};

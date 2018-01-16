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

import {PrimeElement} from "../Document/PrimeElement";
import {Utils} from "../Utils";
import {PrimeDocument} from "../PrimeDocument";

class Draggable {
  /**
   * Constructs a new Draggable object for the given element.
   *
   * @param {PrimeElement|Element|EventTarget} element The Prime Element for the Draggable widget.
   * @param {string} [gripSelector=] gripSelector The optional selector to identify the 'grippy' part.
   * @constructor
   */
  constructor(element, gripSelector) {
    Utils.bindAll(this);

    this.element = PrimeElement.wrap(element);
    this.offset = {};

    if (!Utils.isDefined(gripSelector)) {
      this.grip = this.element;
    } else {
      this.grip = this.element.queryFirst(gripSelector);
      if (this.grip === null) {
        throw Error('Unable to find an element using the provided selector [' + gripSelector + ']');
      }
    }
  }

  /**
   * Destroys the Draggable Widget
   */
  destroy() {
    this.element.removeClass('active');
    this.element.setStyles(this.originalStyle);

    this.grip.removeEventListener('mousedown', this._handleMouseDown);
    PrimeDocument.removeEventListener('mousemove', this._handleMouseMove);
    PrimeDocument.removeEventListener('mouseup', this._handleMouseUp);
  }

  /**
   * Initializes the Draggable by attaching the event listeners.
   *
   * @returns {Draggable} This.
   */
  initialize() {
    this.originalStyle = {
      cursor: this.element.getStyle('cursor'),
      zIndex: this.element.getStyle('zIndex')
    };

    this.grip.addEventListener('mousedown', this._handleMouseDown).setStyle('cursor', 'move');
    return this;
  }

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handle Mouse Down Event
   * @param {Event} event The mouse event.
   * @private
   */
  _handleMouseDown(event) {
    event.preventDefault();
    this.element.addClass('active');

    this.offset = {
      zIndex: this.element.getStyle('zIndex'),
      height: this.element.getOuterHeight(),
      width: this.element.getOuterWidth(),
      x: event.screenX,
      y: event.screenY
    };

    this.element.setStyle('zIndex', this.offset.zIndex + 10);

    // Remove old listeners
    PrimeDocument.removeEventListener('mousemove', this._handleMouseMove);
    PrimeDocument.removeEventListener('mouseup', this._handleMouseUp);

    // Attach all the events
    PrimeDocument.addEventListener('mousemove', this._handleMouseMove);
    PrimeDocument.addEventListener('mouseup', this._handleMouseUp);
  }

  /**
   * Handle the Mouse Move event for the body element.
   *
   * @param {Event} event The mouse event.
   * @private
   */
  _handleMouseMove(event) {
    const xDiff = event.screenX - this.offset.x;
    const yDiff = event.screenY - this.offset.y;
    this.offset.x = event.screenX;
    this.offset.y = event.screenY;
    this.element.setLeft(this.element.getLeft() + xDiff);
    this.element.setTop(this.element.getTop() + yDiff);
  }

  /**
   * Handle the Mouse Up event for this draggable widget.
   * @private
   */
  _handleMouseUp() {
    PrimeDocument.removeEventListener('mousemove', this._handleMouseMove);
    PrimeDocument.removeEventListener('mouseup', this._handleMouseUp);
    this.element.setStyle('zIndex', this.offset.zIndex);
    this.element.removeClass('active');
  }
}

export {Draggable}

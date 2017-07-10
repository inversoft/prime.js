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

/**
 * The Prime.Widgets namespace.
 *
 * @namespace Prime.Widgets
 */
Prime.Widgets = Prime.Widgets || {};

/**
 * Constructs a new Draggable object for the given element.
 *
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element for the Draggable widget.
 * @param {string} [gripSelector=] gripSelector The optional selector to identify the 'grippy' part.
 * @constructor
 */
Prime.Widgets.Draggable = function(element, gripSelector) {
  Prime.Utils.bindAll(this);

  this.element = Prime.Document.Element.wrap(element);
  this.offset = {};

  if (!Prime.Utils.isDefined(gripSelector)) {
    this.grip = this.element;
  } else {
    this.grip = this.element.queryFirst(gripSelector);
    if (this.grip === null) {
      throw Error('Unable to find an element using the provided selector [' + gripSelector + ']');
    }
  }
};

Prime.Widgets.Draggable.prototype = {
  /**
   * Destroys the Draggable Widget
   */
  destroy: function() {
    this.element.removeClass('active');
    this.element.setStyles(this.originalStyle);

    this.grip.removeEventListener('mousedown', this._handleMouseDown);
    Prime.Document.removeEventListener('mousemove', this._handleMouseMove);
    Prime.Document.removeEventListener('mouseup', this._handleMouseUp);
  },

  /**
   * Initializes the Draggable by attaching the event listeners.
   *
   * @returns {Prime.Widgets.Draggable} This.
   */
  initialize: function() {
    this.originalStyle = {
      'cursor': this.element.getStyle('cursor'),
      'zIndex': this.element.getStyle('zIndex')
    };

    this.grip.addEventListener('mousedown', this._handleMouseDown).setStyle('cursor', 'move');
    return this;
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handle Mouse Down Event
   * @param {Event} event The mouse event.
   * @private
   */
  _handleMouseDown: function(event) {
    event.preventDefault();
    this.element.addClass('active');

    this.offset = {
      'zIndex': this.element.getStyle('zIndex'),
      'height': this.element.getOuterHeight(),
      'width': this.element.getOuterWidth(),
      'x': event.screenX,
      'y': event.screenY
    };

    this.element.setStyle('zIndex', this.offset.zIndex + 10);

    // Remove old listeners
    Prime.Document.removeEventListener('mousemove', this._handleMouseMove);
    Prime.Document.removeEventListener('mouseup', this._handleMouseUp);

    // Attach all the events
    Prime.Document.addEventListener('mousemove', this._handleMouseMove);
    Prime.Document.addEventListener('mouseup', this._handleMouseUp);
  },

  /**
   * Handle the Mouse Move event for the body element.
   *
   * @param {Event} event The mouse event.
   * @private
   */
  _handleMouseMove: function(event) {
    var xDiff = event.screenX - this.offset.x;
    var yDiff = event.screenY - this.offset.y;
    this.offset.x = event.screenX;
    this.offset.y = event.screenY;
    this.element.setLeft(this.element.getLeft() + xDiff);
    this.element.setTop(this.element.getTop() + yDiff);
  },

  /**
   * Handle the Mouse Up event for this draggable widget.
   * @private
   */
  _handleMouseUp: function() {
    Prime.Document.removeEventListener('mousemove', this._handleMouseMove);
    Prime.Document.removeEventListener('mouseup', this._handleMouseUp);
    this.element.setStyle('zIndex', this.offset.zIndex);
    this.element.removeClass('active');
  }
};
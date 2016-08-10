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
 * @param {string} [gripSelector=] gripSelector  The optional selector to identify the 'grippy' part.
 * @constructor
 */
Prime.Widgets.Draggable = function(element, gripSelector) {
  Prime.Utils.bindAll(this);

  this.element = Prime.Document.Element.wrap(element);
  if (typeof gripSelector === 'undefined' || gripSelector === null) {
    this.grip = this.element;
  } else {
    this.grip = this.element.queryFirst(gripSelector);
    if (this.grip === null) {
      throw Error('Unable to find an element using the provided selector [' + gripSelector + ']');
    }
  }
  this.grip.addClass('prime-draggable-grip');

  this.originalStyle = {
    'cursor': this.element.getStyle('cursor'),
    'z-index': this.element.getStyle('z-index')
  };

  this.offset = {};

  this.grip.addEventListener('mousedown', this._handleMouseDown);
  this.element.addEventListener('mouseup', this._handleOnMouseUp);

  this.parent = new Prime.Document.Element(this.element.domElement.parentNode);
  this.parent.addEventListener('mouseup', this._handleParentMouseUp);
  this.element.addClass('prime-draggable');
};

Prime.Widgets.Draggable.prototype = {

  /**
   * Destroys the Draggable Widget
   */
  destroy: function() {
    this.element.removeClass('prime-draggable prime-draggable-active');
    this.element.setStyles(this.originalStyle);
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

    this.element.addClass('prime-draggable-active');

    this.offset = {
      'z_index': this.element.getStyle('z-index'),
      'height': this.element.getOuterHeight(),
      'width': this.element.getOuterWidth(),
      'x': this.element.getLeft() + this.element.getOuterWidth() - event.pageX,
      'y': this.element.getTop() + this.element.getOuterHeight() - event.pageY
    };

    this.element.setStyle('z-index', this.offset.z_index + 1000);
    // defensive move to make sure we don't register more than one.
    this.parent.removeEventListener('mousemove', this._handleParentMouseMove);
    this.parent.addEventListener('mousemove', this._handleParentMouseMove);
    event.preventDefault();
  },

  /**
   * Handle the Mouse Move event for the parent element of this draggable widget.
   * @param {Event} event The mouse event.
   * @private
   */
  _handleParentMouseMove: function(event) {
    this.element.setLeft(event.pageX + this.offset.x - this.offset.width);
    this.element.setTop(event.pageY + this.offset.y - this.offset.height);
  },

  /**
   * Handle Mouse Up event for the parent element of this draggable widget.
   * @private
   */
  _handleParentMouseUp: function() {
    this.element.removeClass('prime-draggable-active');
    this.element.setStyle('z-index', this.offset.z_index);
  },

  /**
   * Handle the Mouse Up event for this draggable widget.
   * @private
   */
  _handleOnMouseUp: function() {
    this.parent.removeEventListener('mousemove', this._handleParentMouseMove);
    this.element.removeClass('prime-draggable-active');
  }

};
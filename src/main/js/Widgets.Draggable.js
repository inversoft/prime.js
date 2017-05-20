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
  this._setInitialOptions();

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
    this.element.removeClass(this.options['className']);
    this.element.removeClass('active');
    this.element.setStyles(this.originalStyle);
  },

  /**
   * Initializes the Draggable by attaching the event listeners.
   *
   * @returns {Prime.Widgets.Draggable} This.
   */
  initialize: function() {
    this.grip.addClass(this.options['gripClassName']);

    this.originalStyle = {
      'cursor': this.element.getStyle('cursor'),
      'zIndex': this.element.getStyle('zIndex')
    };

    this.grip.addEventListener('mousedown', this._handleMouseDown);
    this.element.addEventListener('mouseup', this._handleOnMouseUp);

    this.parent = new Prime.Document.Element(this.element.domElement.parentNode);
    this.parent.addEventListener('mouseup', this._handleParentMouseUp);
    this.element.addClass(this.options['className']);
    return this;
  },

  /**
   * Set more than one option at a time by providing a map of key value pairs. This is considered an advanced
   * method to set options on the widget. The caller needs to know what properties are valid in the options object.
   *
   * @param {Object} options Key value pair of configuration options.
   * @returns {Prime.Widgets.AJAXDialog} This.
   */
  withOptions: function(options) {
    if (!Prime.Utils.isDefined(options)) {
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
   * Handle Mouse Down Event
   * @param {Event} event The mouse event.
   * @private
   */
  _handleMouseDown: function(event) {
    this.element.addClass('active');

    this.offset = {
      'zIndex': this.element.getStyle('zIndex'),
      'height': this.element.getOuterHeight(),
      'width': this.element.getOuterWidth(),
      'x': this.element.getLeft() + this.element.getOuterWidth() - event.pageX,
      'y': this.element.getTop() + this.element.getOuterHeight() - event.pageY
    };

    this.element.setStyle('zIndex', this.offset.zIndex + 10);
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
    var scrollTop = Prime.Window.getScrollTop();
    this.element.setTop(event.pageY + this.offset.y - this.offset.height + scrollTop);
  },

  /**
   * Handle Mouse Up event for the parent element of this draggable widget.
   * @private
   */
  _handleParentMouseUp: function() {
    this.element.removeClass('active');
    this.element.setStyle('zIndex', this.offset.zIndex);
  },

  /**
   * Handle the Mouse Up event for this draggable widget.
   * @private
   */
  _handleOnMouseUp: function() {
    this.parent.removeEventListener('mousemove', this._handleParentMouseMove);
    this.element.removeClass('active');
  },

  /**
   * Set the initial options for this widget.
   * @private
   */
  _setInitialOptions: function() {
    // Defaults
    this.options = {
      'className': 'prime-draggable',
      'gripClassName': 'grip'
    };
  }
};
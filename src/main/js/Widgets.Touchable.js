/*
 * Copyright (c) 2016, Inversoft Inc., All Rights Reserved
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
 * Constructs a new Touchable object for the given element.
 *
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element for the Touchable widget.
 * @param {Function} [eventPropagationHandler] A Function that handles how the event is handled for the touchstart,
 * touchend, touchmove, and touchcancel events. This Function takes the event object as its only parameter.
 * @constructor
 */
Prime.Widgets.Touchable = function(element, eventPropagationHandler) {
  Prime.Utils.bindAll(this);

  this.element = Prime.Document.Element.wrap(element);
  this.eventPropagationHandler = eventPropagationHandler;
};

Prime.Widgets.Touchable.constructor = Prime.Widgets.Touchable;
Prime.Widgets.Touchable.prototype = {
  /**
   * Destroys the Touchable Widget
   */
  destroy: function() {
    this.element
        .removeEventListener('touchstart', this._handleTouchStart)
        .removeEventListener('touchmove', this._handleTouchMove)
        .removeEventListener('touchcancel', this._handleTouchCancel)
        .removeEventListener('touchend', this._handleTouchEnd)
        .removeEventListenersByPattern(/Prime\.Widgets\.Touchable:.+/)
  },

  /**
   * Initializes the widget by attaching all of the event listeners to the element.
   *
   * @returns {Prime.Widgets.Touchable} This.
   */
  initialize: function() {
    this.element
        .addEventListener('touchstart', this._handleTouchStart)
        .addEventListener('touchmove', this._handleTouchMove)
        .addEventListener('touchcancel', this._handleTouchCancel)
        .addEventListener('touchend', this._handleTouchEnd);
    return this;
  },

  /**
   * Provide a handler that will be called when a long press is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withLongPressHandler: function(handler) {
    this.element.addEventListener('Prime.Widgets.Touchable:longPress', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a move event is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withMoveHandler: function(handler) {
    this.element.addEventListener('Prime.Widgets.Touchable:move', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a long press is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeDownHandler: function(handler) {
    this.element.addEventListener('Prime.Widgets.Touchable:swipeDown', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe left event is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeLeftHandler: function(handler) {
    this.element.addEventListener('Prime.Widgets.Touchable:swipeLeft', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe right event is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeRightHandler: function(handler) {
    this.element.addEventListener('Prime.Widgets.Touchable:swipeRight', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe up event is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeUpHandler: function(handler) {
    this.element.addEventListener('Prime.Widgets.Touchable:swipeUp', handler);
    return this;
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Collects all of the touch data at the end of the touch and calculates the distances and times.
   *
   * @param {TouchEvent} event The TouchEvent.
   * @private
   */
  _collectTouchData: function(event) {
    var touchPoints = event.changedTouches.length;
    if (touchPoints > 1) {
      return;
    }

    var touch = event.changedTouches[0];
    this.elapsedTime = new Date().getTime() - this.touchStarted;
    this.touchEndX = touch.pageX;
    this.touchEndY = touch.pageY;
    this.touchX = this.touchStartX - this.touchEndX;
    this.touchY = this.touchStartY - this.touchEndY;
  },

  /**
   * Called when all processing is finished and the handlers are called based on direction and time of the touches.
   *
   * @private
   */
  _finished: function() {
    // Make sure this was a swipe
    var event = {
      'elapsedTime': this.elapsedTime,
      'touchStartX': this.touchStartX,
      'touchStartY': this.touchStartY,
      'touchEndX': this.touchEndX,
      'touchEndY': this.touchEndY,
      'touchX': this.touchX,
      'touchY': this.touchY,
      'element': this.element,
      'target': this.element.domElement
    };
    event.swipe = Math.abs(event.touchX) > 50 || Math.abs(event.touchY) > 50;
    event.swipeX = event.swipe && Math.abs(event.touchX) > Math.abs(event.touchY);
    event.swipeY = event.swipe && !event.swipeX;
    event.longPress = !event.swipe && event.elapsedTime > 500;

    if (event.longPress) {
      this.element.fireCustomEvent('Prime.Widgets.Touchable:longPress', event);
    } else if (event.swipeX && event.touchX > 0) {
      this.element.fireCustomEvent('Prime.Widgets.Touchable:swipeLeft', event);
    } else if (event.swipeX) {
      this.element.fireCustomEvent('Prime.Widgets.Touchable:swipeRight', event);
    } else if (event.swipeY && event.touchY > 0) {
      this.element.fireCustomEvent('Prime.Widgets.Touchable:swipeUp', event);
    } else if (event.swipeY) {
      this.element.fireCustomEvent('Prime.Widgets.Touchable:swipeDown', event);
    }
  },

  /**
   * Handle the touch cancel event.
   *
   * @param {TouchEvent} event The touch event.
   * @private
   */
  _handleTouchCancel: function(event) {
    this._collectTouchData(event);
    this._finished();
    if (Prime.Utils.isDefined(this.eventPropagationHandler)) {
      this.eventPropagationHandler(event);
    }
  },

  /**
   * Handle the touch end event.
   *
   * @param {TouchEvent} event The touch event.
   * @private
   */
  _handleTouchEnd: function(event) {
    this._collectTouchData(event);
    this._finished();
    if (Prime.Utils.isDefined(this.eventPropagationHandler)) {
      this.eventPropagationHandler(event);
    }
  },

  /**
   * Handle the touch move event.
   *
   * @param {TouchEvent} event The touch event.
   * @private
   */
  _handleTouchMove: function(event) {
    this.element.fireEvent('Prime.Widgets.Touchable:move', event);
    if (Prime.Utils.isDefined(this.eventPropagationHandler)) {
      this.eventPropagationHandler(event);
    }
  },

  /**
   * Handle the touch start event.
   *
   * @param {TouchEvent} event The touch event.
   * @private
   */
  _handleTouchStart: function(event) {
    var touchPoints = event.changedTouches.length;
    if (touchPoints > 1) {
      if (Prime.Utils.isDefined(this.eventPropagationHandler)) {
        this.eventPropagationHandler(event);
      }

      return;
    }

    var touch = event.changedTouches[0];
    this.touchStarted = new Date().getTime();
    this.touchStartX = touch.pageX;
    this.touchStartY = touch.pageY;
    if (Prime.Utils.isDefined(this.eventPropagationHandler)) {
      this.eventPropagationHandler(event);
    }
  }
};
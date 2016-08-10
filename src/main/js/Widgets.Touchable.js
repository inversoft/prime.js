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
 * @constructor
 */
Prime.Widgets.Touchable = function(element) {
  Prime.Utils.bindAll(this);

  this.element = Prime.Document.Element.wrap(element);
  this.element
      .addEventListener('touchstart', this._handleTouchStart, this)
      .addEventListener('touchcancel', this._handleTouchCancel, this)
      .addEventListener('touchend', this._handleTouchEnd, this);
};

Prime.Widgets.Touchable.constructor = Prime.Widgets.Touchable;
Prime.Widgets.Touchable.prototype = {
  /**
   * Destroys the Touchable Widget
   */
  destroy: function() {
    this.element.removeEventListener('touchstart', this._handleTouchStart)
        .removeEventListener('touchcancel', this._handleTouchCancel)
        .removeEventListener('touchend', this._handleTouchEnd);
  },

  /**
   * Provide a handler that will be called when a long press is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withLongPressHandler: function(handler) {
    this.element.addEventListener('touch:longPress', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a move event is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withMoveHandler: function(handler) {
    this.element.addEventListener('touchmove', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a long press is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeDownHandler: function(handler) {
    this.element.addEventListener('touch:swipeDown', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe left event is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeLeftHandler: function(handler) {
    this.element.addEventListener('touch:swipeLeft', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe right event is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeRightHandler: function(handler) {
    this.element.addEventListener('touch:swipeRight', handler);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe up event is detected.
   *
   * @param {Function} handler The event handler.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeUpHandler: function(handler) {
    this.element.addEventListener('touch:swipeUp', handler);
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
   * @param {TouchEvent} event The TouchEvent.
   * @private
   */
  _finished: function(event) {
    // Make sure this was a swipe
    var swipe = Math.abs(this.touchX) > 50 || Math.abs(this.touchY) > 50;
    var swipeX = swipe && Math.abs(this.touchX) > Math.abs(this.touchY);
    var swipeY = swipe && !swipeX;
    var longPress = !swipe && this.elapsedTime > 500;
    // this.element.setHTML('touchStartX:' + this.touchStartX +
    //     'touchStartY:' + this.touchStartY + '<br/>' +
    //     'touchEndX:' + this.touchEndX + '<br/>' +
    //     'touchEndY:' + this.touchEndY + '<br/>' +
    //     'touchX:' + this.touchX + '<br/>' +
    //     'touchY:' + this.touchY + '<br/>' +
    //     'elapsedTime:' + this.elapsedTime + '<br/>' +
    //     'swipe:' + swipe + '<br/>' +
    //     'longPress:' + longPress
    // );
    // console.log('touchStartX:' + this.touchStartX);
    // console.log('touchStartY:' + this.touchStartY);
    // console.log('touchEndX:' + this.touchEndX);
    // console.log('touchEndY:' + this.touchEndY);
    // console.log('touchX:' + this.touchX);
    // console.log('touchY:' + this.touchY);
    // console.log('elapsedTime:' + this.elapsedTime);
    // console.log('swipe:' + swipe);
    // console.log('longPress:' + longPress);

    if (longPress) {
      this.element.fireCustomEvent('touch:longPress', event);
    } else if (swipeX && this.touchX > 0) {
      this.element.fireCustomEvent('touch:swipeLeft', event);
    } else if (swipeX) {
      this.element.fireCustomEvent('touch:swipeRight', event);
    } else if (swipeY && this.touchY > 0) {
      this.element.fireCustomEvent('touch:swipeUp', event);
    } else if (swipeY) {
      this.element.fireCustomEvent('touch:swipeDown', event);
    }
  },

  /**
   * Handle the touch cancel event.
   *
   * @param {TouchEvent} event The touch event.
   * @returns {boolean} True.
   * @private
   */
  _handleTouchCancel: function(event) {
    this._collectTouchData(event);
    this._finished(event);
    return true;
  },

  /**
   * Handle the touch end event.
   *
   * @param {TouchEvent} event The touch event.
   * @returns {boolean} True.
   * @private
   */
  _handleTouchEnd: function(event) {
    this._collectTouchData(event);
    this._finished(event);
    return true;
  },

  /**
   * Handle the touch start event.
   *
   * @param {TouchEvent} event The touch event.
   * @returns {boolean} True.
   * @private
   */
  _handleTouchStart: function(event) {
    var touchPoints = event.changedTouches.length;
    if (touchPoints > 1) {
      return true;
    }

    var touch = event.changedTouches[0];
    this.touchStarted = new Date().getTime();
    this.touchStartX = touch.pageX;
    this.touchStartY = touch.pageY;
    return true;
  }
};
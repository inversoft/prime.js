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
 * @param {Prime.Document.Element} element The Prime Element for the Touchable widget.
 * @constructor
 */
Prime.Widgets.Touchable = function(element) {
  this.element = element;
  this.element.addEventListener('touchstart', this._handleTouchStart, this)
      .addEventListener('touchend', this._handleTouchEnd, this)
      .addClass('prime-touchable prime-touchable-active');

  this.handlers = {
    longPress: null,
    swipeDown: null,
    swipeLeft: null,
    swipeRight: null,
    swipeUp: null
  }
};

Prime.Widgets.Touchable.constructor = Prime.Widgets.Touchable;
Prime.Widgets.Touchable.prototype = {

  /**
   * Destroys the Touchable Widget
   */
  destroy: function() {
    this.element.removeClass('prime-touchable prime-touchable-active');
  },

  /**
   * Provide a handler that will be called when a long press is detected.
   * @param {Function} handler The event handler.
   * @param {Object} [context=this] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Object.
   * @returns {Prime.Widgets.Touchable} This
   */
  withLongPressHandler: function(handler, context) {
    this.handlers['longPress'] = handler.bind((arguments.length > 1) ? context : this);
    return this;
  },

  /**
   * Provide a handler that will be called when a move event is detected.
   * @param {Function} handler The event handler.
   * @param {Object} [context=this] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Object.
   * @returns {Prime.Widgets.Touchable} This
   */
  withMoveHandler: function(handler, context) {
    this.element.addEventListener('touchmove', handler, (arguments.length > 1) ? context : this);
    return this;
  },

  /**
   * Provide a handler that will be called when a long press is detected.
   * @param {Function} handler The event handler.
   * @param {Object} [context=this] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Object.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeDownHandler: function(handler, context) {
    this.handlers['swipeDown'] = handler.bind((arguments.length > 1) ? context : this);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe left event is detected.
   * @param {Function} handler The event handler.
   * @param {Object} [context=this] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Object.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeLeftHandler: function(handler, context) {
    this.handlers['swipeLeft'] = handler.bind((arguments.length > 1) ? context : this);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe right event is detected.
   * @param {Function} handler The event handler.
   * @param {Object} [context=this] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Object.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeRightHandler: function(handler, context) {
    this.handlers['swipeRight'] = handler.bind((arguments.length > 1) ? context : this);
    return this;
  },

  /**
   * Provide a handler that will be called when a swipe up event is detected.
   * @param {Function} handler The event handler.
   * @param {Object} [context=this] The context to use when invoking the handler (this sets the 'this' variable for the
   *        function call). Defaults to this Object.
   * @returns {Prime.Widgets.Touchable} This
   */
  withSwipeUpHandler: function(handler, context) {
    this.handlers['swipeUp'] = handler.bind((arguments.length > 1) ? context : this);
    return this;
  },

  /* ===================================================================================================================
   * Private methods
   * ===================================================================================================================*/

  /**
   * Handle the touch start event.
   * @param {TouchEvent} event The touch event.
   * @returns {boolean}
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
    return false;
  },

  /**
   * Handle the touch end event.
   * @param {TouchEvent} event The touch event.
   * @returns {boolean}
   * @private
   */
  _handleTouchEnd: function(event) {
    var touchPoints = event.changedTouches.length;
    if (touchPoints > 1) {
      return true;
    }

    var touch = event.changedTouches[0];
    var elapsedTime = new Date().getTime() - this.touchStarted;
    this.touchEndX = touch.pageX;
    this.touchEndY = touch.pageY;

    // A tap event has a touch contact time of greater than 100 ms and less than 1000 ms
    if (elapsedTime > 500 && elapsedTime < 1000) {
      // A tap event should not move along the x-axis more than 100 px ?
      if (Math.abs(this.touchStartX - this.touchEndX) < 100) {
        if (this.handlers['longPress'] !== null) {
          this.handlers['longPress']();
        }
        return false;
      }
    }

    if (elapsedTime > 100) {
      if (Math.abs(this.touchStartX - this.touchEndX) > 150) {
        if (this.touchEndX > this.touchStartX) {
          if (this.handlers['swipeRight'] !== null) {
            this.handlers['swipeRight']();
          }
        } else {
          if (this.handlers['swipeLeft'] !== null) {
            this.handlers['swipeLeft']();
          }
        }
      }

      if (Math.abs(this.touchStartY - this.touchEndY) > 50) {
        if (this.touchEndY > this.touchStartY) {
          if (this.handlers['swipeDown'] !== null) {
            this.handlers['swipeDown']();
          }
        } else {
          if (this.handlers['swipeUp'] !== null) {
            this.handlers['swipeUp']();
          }
        }

      }
    }
    return false;
  }
};
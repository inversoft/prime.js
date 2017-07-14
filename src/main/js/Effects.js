/*
 * Copyright (c) 2012-2015, Inversoft Inc., All Rights Reserved
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
 * The Prime.Effects namespace. This contains all of the effect abstract and implementation classes.
 *
 * @namespace Prime.Effects
 */
Prime.Effects = Prime.Effects || {};


/**
 * Constructs a BaseTransition for the given element.
 *
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element the effect will be applied to.
 * @param {number} endValue The end value for the transition.
 * @constructor
 */
Prime.Effects.BaseTransition = function(element, endValue) {
  Prime.Utils.bindAll(this);
  this.element = Prime.Document.Element.wrap(element);
  this.duration = 1000;
  this.endFunction = null;
  this.endValue = endValue;
  this.iterations = 20;
};

Prime.Effects.BaseTransition.prototype = {
  /**
   * Sets the function that is called when the effect has completed.
   *
   * @param {Function} endFunction The function that is called when the effect is completed.
   * @returns {Prime.Effects.BaseTransition} This Effect.
   */
  withEndFunction: function(endFunction) {
    this.endFunction = endFunction;
    return this;
  },

  /**
   * Sets the duration of the fade-out effect.
   *
   * @param {number} duration The duration in milliseconds.
   * @returns {Prime.Effects.BaseTransition} This Effect.
   */
  withDuration: function(duration) {
    if (duration < 100) {
      throw new TypeError('Duration should be greater than 100 milliseconds or it won\'t really be noticeable');
    }

    this.duration = duration;
    return this;
  },

  /*
   * Protected functions
   */

  /**
   * Changes an integer style property of the Element iteratively over a given period of time from one value to another
   * value.
   *
   * @protected
   * @param {Function} getFunction The function on the element to call to get the current value for the transition.
   * @param {Function} setFunction The function on the element to call to set the new value for the transition.
   */
  _changeNumberStyleIteratively: function(getFunction, setFunction) {
    var currentValue = getFunction.call(this.element);
    var step = Math.abs(this.endValue - currentValue) / this.iterations;

    // Close around ourselves
    var self = this;
    var stepFunction = function(last) {
      if (last) {
        currentValue = self.endValue;
      } else {
        if (currentValue < self.endValue) {
          currentValue += step;
        } else {
          currentValue -= step;
        }
      }

      setFunction.call(self.element, currentValue);
    };

    Prime.Utils.callIteratively(this.duration, this.iterations, stepFunction, this._internalEndFunction);
  },

  /* ===================================================================================================================
   * Private Methods
   * ===================================================================================================================*/

  /**
   * Handles the call back at the end.
   *
   * @private
   */
  _internalEndFunction: function() {
    if (this._subclassEndFunction) {
      this._subclassEndFunction(this);
    }

    if (this.endFunction) {
      this.endFunction(this);
    }
  }
};

/**
 * Constructs a new Fade for the given element. The fade effect uses the CSS opacity style and supports the IE alpha
 * style. The duration defaults to 1000 milliseconds (1 second). This changes the opacity over the duration from 1.0 to
 * 0.0. At the end, this hides the element so that it doesn't take up any space.
 *
 * @constructor
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element to fade out.
 */
Prime.Effects.Fade = function(element) {
  Prime.Effects.BaseTransition.call(this, element, 0.0);
};
Prime.Effects.Fade.prototype = Object.create(Prime.Effects.BaseTransition.prototype);
Prime.Effects.Fade.constructor = Prime.Effects.Fade;

/**
 * Internal call back at the end of the transition. This hides the element so it doesn't take up space.
 *
 * @private
 */
Prime.Effects.Fade.prototype._subclassEndFunction = function() {
  this.element.hide();
};

/**
 * Executes the fade effect on the element using the opacity style.
 */
Prime.Effects.Fade.prototype.go = function() {
  this._changeNumberStyleIteratively(this.element.getOpacity, this.element.setOpacity);
};


/**
 * Constructs a new Appear for the given element. The appear effect uses the CSS opacity style and supports the IE
 * alpha style. The duration defaults to 1000 milliseconds (1 second). This first sets the opacity to 0, then it shows
 * the element and finally it raises the opacity.
 *
 * @constructor
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element to appear.
 * @param {number} [opacity=1.0] The final opacity to reach when the effect is complete. Defaults to 1.0.
 */
Prime.Effects.Appear = function(element, opacity) {
  if (!Prime.Utils.isDefined(opacity)) {
    opacity = 1.0;
  }
  Prime.Effects.BaseTransition.call(this, element, opacity);
};
Prime.Effects.Appear.prototype = Object.create(Prime.Effects.BaseTransition.prototype);
Prime.Effects.Appear.constructor = Prime.Effects.Appear;

/**
 * Executes the appear effect on the element using the opacity style.
 */
Prime.Effects.Appear.prototype.go = function() {
  this.element.setOpacity(0.0);
  this.element.show();
  this._changeNumberStyleIteratively(this.element.getOpacity, this.element.setOpacity);
};

/**
 * Constructs a new ScrollTo for the given element. The duration defaults to 1000 milliseconds (1 second).
 *
 * @param {Prime.Document.Element|Element|EventTarget} element The Prime Element to scroll.
 * @param {number} position The position to scroll the element to.
 * @constructor
 */
Prime.Effects.ScrollTo = function(element, position) {
  this.axis = 'vertical';
  Prime.Effects.BaseTransition.call(this, element, position);
};

Prime.Effects.ScrollTo.prototype = Object.create(Prime.Effects.BaseTransition.prototype);
Prime.Effects.ScrollTo.constructor = Prime.Effects.ScrollTo;

/**
 * Set the scroll axis, either 'horizontal' or 'vertical'. Default is 'vertical'.
 *
 * @param {string} axis The axis to scroll.
 * @returns {Prime.Effects.ScrollTo}
 */
Prime.Effects.ScrollTo.prototype.withAxis = function(axis) {
  this.axis = axis || 'vertical';
  return this;
};

/**
 * Executes the scroll effect on the element.
 */
Prime.Effects.ScrollTo.prototype.go = function() {
  if (this.axis === 'vertical') {
    this._changeNumberStyleIteratively(this.element.getScrollTop, this.element.scrollTo);
  } else {
    this._changeNumberStyleIteratively(this.element.getScrollLeft, this.element.scrollLeftTo);
  }
};

/**
 * Creates a SlideOpen effect on the given element.
 *
 * @param {Prime.Document.Element} element The element.
 * @constructor
 */
Prime.Effects.SlideOpen = function(element) {
  Prime.Utils.bindAll(this);

  this.element = element;
  if (element.getHeight() !== 0 || element.hasClass('open')) {
    element.domElement.primeVisibleHeight = element.getHeight();
  } else {
    element.setStyle('height', 'auto');
    element.domElement.primeVisibleHeight = element.getHeight();
    element.setStyle('height', '0');
  }
};

Prime.Effects.SlideOpen.prototype = {
  toggle: function() {
    if (this.element.getHeight() !== 0 || this.element.hasClass('open')) {
      this.element.setHeight(this.element.domElement.primeVisibleHeight);
      this.element.removeClass('open');
      setTimeout(function() {
        this.element.setHeight(0);
      }.bind(this), 100);
    } else {
      this.element.setHeight(this.element.domElement.primeVisibleHeight);
      setTimeout(function() {
        this.element.setHeight('auto');
      }.bind(this), 500);
    }
  }
};
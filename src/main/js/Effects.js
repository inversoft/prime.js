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
 * @param {Prime.Document.Element} element The Prime Element the effect will be applied to.
 * @param {number} endValue The end value for the transition.
 * @constructor
 */
Prime.Effects.BaseTransition = function(element, endValue) {
  this.context = null;
  this.duration = 1000;
  this.element = element;
  this.endFunction = null;
  this.endValue = endValue;
  this.iterations = 20;
};

Prime.Effects.BaseTransition.prototype = {
  /**
   * Sets the function that is called when the effect has completed.
   *
   * @param {Function} endFunction The function that is called when the effect is completed.
   * @param {Object} [context] The context for the function call (sets the 'this' parameter). Defaults to the Element.
   * @returns {Prime.Effects.BaseTransition} This Effect.
   */
  withEndFunction: function(endFunction, context) {
    this.endFunction = endFunction;
    this.context = context;
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
  changeNumberStyleIteratively: function(getFunction, setFunction) {
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

    Prime.Utils.callIteratively(this.duration, this.iterations, stepFunction, this._internalEndFunction, this);
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
    this._subclassEndFunction();
    var context = this.context || this.element;
    if (this.endFunction !== null) {
      this.endFunction.call(context);
    }
  }
};

/**
 * Constructs a new Fade for the given element. The fade effect uses the CSS opacity style and supports the IE alpha
 * style. The duration defaults to 1000 milliseconds (1 second). This changes the opacity over the duration from 1.0 to
 * 0.0. At the end, this hides the element so that it doesn't take up any space.
 *
 * @constructor
 * @param {Prime.Document.Element} element The Prime Element to fade out.
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
  this.changeNumberStyleIteratively(this.element.getOpacity, this.element.setOpacity);
};


/**
 * Constructs a new Appear for the given element. The appear effect uses the CSS opacity style and supports the IE
 * alpha style. The duration defaults to 1000 milliseconds (1 second). This first sets the opacity to 0, then it shows
 * the element and finally it raises the opacity.
 *
 * @constructor
 * @param {Prime.Document.Element} element The Prime Element to appear.
 * @param {number} [opacity=1.0] The final opacity to reach when the effect is complete. Defaults to 1.0.
 */
Prime.Effects.Appear = function(element, opacity) {
  if (typeof opacity === 'undefined' || opacity === null) {
    opacity = 1.0;
  }
  Prime.Effects.BaseTransition.call(this, element, opacity);
};
Prime.Effects.Appear.prototype = Object.create(Prime.Effects.BaseTransition.prototype);
Prime.Effects.Appear.constructor = Prime.Effects.Appear;

/**
 * Internal call back at the end of the transition. This does nothing since the Appear has no change at the end.
 *
 * @private
 */
Prime.Effects.Appear.prototype._subclassEndFunction = function() {
  // Nothing.
};

/**
 * Executes the appear effect on the element using the opacity style.
 */
Prime.Effects.Appear.prototype.go = function() {
  this.element.setOpacity(0.0);
  this.element.show();
  this.changeNumberStyleIteratively(this.element.getOpacity, this.element.setOpacity);
};

/**
 * Constructs a new ScrollTo for the given element. The duration defaults to 1000 milliseconds (1 second).
 *
 * @param {Prime.Document.Element} element The Prime Element to scroll.
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
Prime.Effects.ScrollTo.prototype.withAxix = function(axis) {
  this.axis = axis || 'vertical';
  return this;
};

Prime.Effects.ScrollTo.prototype._subclassEndFunction = function() {
  // Nothing;
};

/**
 * Executes the scroll effect on the element.
 */
Prime.Effects.ScrollTo.prototype.go = function() {
  if (this.axis === 'vertical') {
    this.changeNumberStyleIteratively(this.element.getScrollTop, this.element.scrollTo);
  } else {
    this.changeNumberStyleIteratively(this.element.getScrollLeft, this.element.scrollLeftTo);
  }
};
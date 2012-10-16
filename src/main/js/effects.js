/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
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
Prime.Effects = Prime.Effects || {};


/**
 * Constructs a BaseEffect for the given element.
 *
 * @param {Element} element The DOM element the effect will be applied to.
 * @constructor
 */
Prime.Effects.BaseEffect = function(element) {
  this.element = element;
//  console.log("Super");
//  console.log(this);
};
Prime.Effects.BaseEffect.prototype = {
  /**
   * Changes an integer style property of the Element iteratively over a given period of time from one value to another
   * value.
   *
   * @private
   * @param {Object} config The configuration object for the iteration. This must contain the name of the style property
   *        being changed, the units of the property (px, em, etc), the defaultStartValue if the element doesn't have the
   *        style already, the end value, the duration, and the number of iterations.
   * @param {Function} [endFunction] Optional end function to call.
   * @param {Object} [context] Optional context for the function calls.
   */
  changeStyleIteratively: function(config, endFunction, context) {
//    console.log("Change");
//    console.log(this);
    var domElement = this.element.domElement;
    var currentValue = (domElement.style[config.name]) ? (domElement.style[config.name]) : config.defaultStartValue;
    var step = currentValue / config.iterations;
    var stepFunction = function(last) {
      if (last) {
        currentValue = config.endValue;
      } else {
        if (currentValue < config.endValue) {
          currentValue += step;
        } else {
          currentValue -= step;
        }
      }

      domElement.style[config.name] = currentValue + config.units;

      // Handle the special opacity case for IE
      if (config.name === 'opacity') {
        domElement.style.filter = 'alpha(opacity=' + currentValue + config.units + ')';
      }
    };

    Prime.Utils.callIteratively(config.duration, config.iterations, stepFunction, endFunction, context);
  }
};

/**
 * Constructs a new Fade for the given element. The fade-out effect uses the CSS opacity style and supports the IE
 * alpha style. The duration defaults to 1000 milliseconds (1 second).
 *
 * @param {Element} element The element to fade out.
 * @constructor
 */
Prime.Effects.Fade = function(element) {
  Prime.Effects.BaseEffect.apply(this, arguments);
  this.duration = 1000;
  this.context = null;
  this.endFunction = null;
//  console.log("Constructor");
//  console.log(this);
};
Prime.Effects.Fade.prototype = new Prime.Effects.BaseEffect();
Prime.Effects.Fade.constructor = Prime.Effects.Fade;

/**
 * Sets the duration of the fade-out effect.
 *
 * @param {Number} duration The duration in milliseconds.
 * @return {Prime.Effects.Fade} This Fade Effect.
 */
Prime.Effects.Fade.prototype.withDuration = function(duration) {
  if (duration < 100) {
    throw 'Duration should be greater than 100 milliseconds or it won\'t really be noticeable';
  }

  this.duration = duration;
  return this;
};

/**
 * Sets the function that is called when the effect has completed.
 *
 * @param {Function} endFunction The function that is called when the effect is completed.
 * @param {Object} [context] The context for the function call (sets the 'this' parameter). Defaults to the Element.
 * @return {Prime.Effects.Fade} This Fade Effect.
 */
Prime.Effects.Fade.prototype.withEndFunction = function(endFunction, context) {
  this.endFunction = endFunction;
  this.context = context;
  return this;
};

/**
 * Executes the fade-out effect on the element using the opacity style.
 */
Prime.Effects.Fade.prototype.go = function() {
  var self = this;
  var theContext = (this.context === null) ? this.element : this.context;
  var internalEndFunction = function() {
    self.element.hide();
    if (self.endFunction !== null) {
      self.endFunction.call(theContext);
    }
  };

  this.changeStyleIteratively({
    name: 'opacity',
    units: '',
    defaultStartValue: 1.0,
    endValue: 0.0,
    duration: this.duration,
    iterations: 20
  }, internalEndFunction, theContext);
};
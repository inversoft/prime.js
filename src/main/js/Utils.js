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


Prime.Utils = {
  spaceRegex: /\s+/,
  typeRegex: /^\[object\s(.*)\]$/,

  /**
   * Calculates the length of the given text using the style of the given element.
   *
   * @param {Prime.Dom.Element} element The element to use the style of.
   * @param {string} text The text to calculate the length of.
   * @returns {number} The length of the text.
   */
  calculateTextLength: function(element, text) {
    var computedStyle = element.getComputedStyle();
    var textCalculator = Prime.Dom.queryByID('prime-text-calculator');
    if (textCalculator === null) {
      textCalculator = Prime.Dom.newElement('<span/>').
          setStyles({
            position: 'absolute',
            width: 'auto',
            fontSize: computedStyle['fontSize'],
            fontFamily: computedStyle['fontFamily'],
            fontWeight: computedStyle['fontWeight'],
            letterSpacing: computedStyle['letterSpacing'],
            whiteSpace: 'nowrap'
          }).
          setID('prime-text-calculator').
          setTop(-9999).
          setLeft(-9999).
          appendTo(document.body);
    }

    textCalculator.setHTML(text);
    return textCalculator.getWidth();
  },

  /**
   * Attempts to invoke a function iteratively in the background a specific number of times within a specific duration.
   * This might not complete in the specified duration. The functions passed in should be short functions that return as
   * quickly as possible. If you are using long functions, use the recursive setTimeout trick by-hand instance.
   *
   * @param {number} totalDuration The duration in milliseconds.
   * @param {number} timesToCall The number of times to call the function.
   * @param {Function} stepFunction The step function to call each iteration.
   * @param {Function} [endFunction] The function to invoke at the end.
   * @param {Object} [context] The context for the function calls (sets the 'this' parameter).
   */
  callIteratively: function(totalDuration, timesToCall, stepFunction, endFunction, context) {
    var theContext = (arguments.length < 5) ? this : context;
    var step = totalDuration / timesToCall;
    var count = 0;
    var id = setInterval(function() {
      count++;
      var last = (count >= timesToCall);
      stepFunction.call(theContext, last);
      if (last) {
        clearInterval(id);

        if (typeof endFunction !== 'undefined' && endFunction !== null) {
          endFunction.call(theContext);
        }
      }
    }, step - 1);
  },

  /**
   * Parses JSON.
   *
   * @param {string} json The JSON.
   * @return {Object} The JSON data as an object.
   */
  parseJSON: function(json) {
    return JSON.parse(json);
  },

  /**
   * Proxies calls to a function through an anonymous function and sets the "this" variable to the object given.
   *
   * @param {Function} func The function to call.
   * @param {Object} context The "this" variable when the function is called.
   * @return {Function} An anonymous function.
   */
  proxy: function(func, context) {
    return function() {
      // DOM level 2 event handlers behave differently than DOM 0 event handlers. We are unifying the event handlers
      // here by checking if the handler returns false and then preventing the default even behavior. This is only used
      // when the arguments are an event
      var result = func.apply(context, arguments);
      if (result === false && arguments[0] instanceof Event) {
        arguments[0].stopPropagation();
        arguments[0].preventDefault();
      }

      return result;
    }
  },

  /**
   * Removes the given object from the given array.
   *
   * @param {Array} array The array to remove from.
   * @param {*} obj The object to remove.
   */
  removeFromArray: function(array, obj) {
    var index = array.indexOf(obj);
    if (index !== -1) {
      var shift = array.splice(index + 1, array.length);
      array.length = index;
      array.push.apply(array, shift);
    }
  },

  type: function(object) {
    return Object.prototype.toString(object).match(Prime.Utils.typeRegex)[1];
  }
};

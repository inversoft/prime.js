/*
 * Copyright (c) 2012-2016, Inversoft Inc., All Rights Reserved
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
 * The Prime.Utils namespace. This contains utility functions.
 *
 * @namespace Prime.Utils
 */
Prime.Utils = {
  spaceRegex: /\s+/,
  typeRegex: /^\[object\s(.*)\]$/,

  /**
   * Calculates the length of the given text using the style of the given element.
   *
   * @param {Prime.Document.Element} element The element to use the style of.
   * @param {string} text The text to calculate the length of.
   * @returns {number} The length of the text.
   */
  calculateTextLength: function(element, text) {
    var computedStyle = element.getComputedStyle();
    var textCalculator = Prime.Document.queryByID('prime-text-calculator');
    if (textCalculator === null) {
      textCalculator = Prime.Document.newElement('<span/>').
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
   * Capitalizes the given String.
   *
   * @param {string} str The String to capitalize.
   * @returns {string} The capitalized String.
   */
  capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  },

  /**
   * Converts CSS style names to style JavaScript names.
   *
   * @param {string} name The CSS style name to convert
   * @returns {string} The converted style name.
   */
  convertStyleName: function(name) {
    if (name === 'float') {
      return 'cssFloat';
    }
    
    var dash = name.indexOf('-');
    if (dash === -1) {
      return name;
    }

    var start = 0;
    var result = '';
    while (dash !== -1) {
      var piece = name.substring(start, dash);
      if (start === 0) {
        result = result.concat(piece);
      } else {
        result = result.concat(Prime.Utils.capitalize(piece));
      }

      start = dash + 1;
      dash = name.indexOf('-', start);
    }

    return result + Prime.Utils.capitalize(name.substring(start));
  },

  /**
   * Return an options map {Object} of the data set values coerced to a typed value of boolean, string or number.
   *
   * @param {Prime.Document.Element} element The element.
   * @returns {Object} The options object.
   */
  dataSetToOptions: function(element) {
    var options = {};
    var data = element.getDataSet();
    for (var prop in data) {
      if (!data.hasOwnProperty(prop)) {
        continue;
      }
      var value = data[prop];
      if (isNaN(value)) {
        if (value === 'true') {
          options[prop] = true;
        } else if (value === 'false') {
          options[prop] = false;
        } else {
          options[prop] = value;
        }
      } else {
        options[prop] = parseInt(value);
      }
    }

    return options;
  },

  /**
   * Determines if an object is an array or not.
   *
   * @param {*} o The object to check.
   * @returns {boolean} True if the object is an array, false otherwise.
   */
  isArray: function(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  },

  /**
   * Parses a CSS measure value (12px) as an integer.
   *
   * @param {string} measure The CSS measure
   * @returns {number} The value as an integer.
   */
  parseCSSMeasure: function(measure) {
    var index = measure.indexOf('px');
    if (index > 0) {
      return parseInt(measure.substring(0, measure.length - 2));
    }

    return parseInt(measure) || 0;
  },

  /**
   * Parses JSON.
   *
   * @param {string} json The JSON.
   * @returns {Object} The JSON data as an object.
   */
  parseJSON: function(json) {
    return JSON.parse(json);
  },

  /**
   * Proxies calls to a function through an anonymous function and sets the "this" variable to the object given.
   *
   * This call is only available for backward compatibility. It is recommended you just use .bind() directly.
   *
   * @param {Function} func The function to call.
   * @param {Object} context The "this" variable when the function is called.
   * @returns {Function} An anonymous function.
   */
  proxy: function(func, context) {
    return func.bind(context);
  },

  /**
   * Removes the objects in the toRemove array from the fromArray.
   *
   * @param {Array} fromArray The array to remove from.
   * @param {Array} toRemove The values to remove.
   */
  removeAllFromArray: function(fromArray, toRemove) {
    for (var i = 0; i < toRemove.length; i++) {
      Prime.Utils.removeFromArray(fromArray, toRemove[i]);
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

  /**
   * Helper function for setInterval that provides context.
   *
   * @param {Function} func The function to call.
   * @param {number} delay The delay
   * @param {Object} context The "this" variable when the function is called.
   * @returns {number} The timer id.
   */
  setInterval: function(func, delay, context) {
    return setInterval(func.bind(context), delay);
  },

  /**
   * Helper function for setTimeout that provides context.
   *
   * @param {Function} func The function to call.
   * @param {number} delay The delay
   * @param {Object} context The "this" variable when the function is called.
   * @returns {number} The timer id.
   */
  setTimeout: function(func, delay, context) {
    return setTimeout(func.bind(context), delay);
  },

  /**
   * Helper function to provide a one liner to behave as if you returned 'false' from a legacy version of Prime.js.
   *
   * Calling this method is equivalent to calling event.preventDefault and event.stopPropagation.
   * @param event
   */
  stopEvent: function(event) {
    // Compatibility with older versions of IE
    event.cancelBubble = true;
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    if (event.preventDefault) {
      event.preventDefault();
    }
  },

  type: function(object) {
    return Object.prototype.toString(object).match(Prime.Utils.typeRegex)[1];
  }
};

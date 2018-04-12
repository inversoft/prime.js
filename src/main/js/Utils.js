/*
 * Copyright (c) 2012-2018, Inversoft Inc., All Rights Reserved
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

import {PrimeDocument} from "./PrimeDocument";

/**
 * The Utils namespace. This contains utility functions.
 *
 * @namespace Utils
 */
const Utils = {
  spaceRegex: /\s+/,
  typeRegex: /^\[object\s(.*)\]$/,

  /**
   * Binds all of the functions inside the object so that <code>this</code> is the object. This is extremely useful for
   * objects that have functions that will be used as event listeners. Rather than having to manage binding and function
   * references manually you can instead bind all of the functions in the object and then use them directly for event
   * listeners.
   *
   * Here's an example:
   *
   * <pre>
   *   function Foo() {
   *     Utils.bindAll(this);
   *
   *     // This function is bound to this (i.e. this.handleClick = this.handleClick.bind(this)).
   *     PrimeDocument.queryFirst('a').addEventListener('click', this.handleClick);
   *   }
   *
   *   Foo.prototype = {
   *     handleClick: function(event) {
   *       ...
   *     }
   *   };
   * </pre>
   *
   * @param {*} object The object to bind all the functions for.
   */
  bindAll: function(object) {
    Utils.getAllPropertyNames(object).forEach((property) => {
      if (property !== 'constructor' && typeof object[property] === 'function' &&
          (object[property].name && !object[property].name.startsWith('bound '))) { // name isn't defined in ie
        Object.defineProperty(object, property, {value: object[property].bind(object)});
      }
    });
  },

  /**
   * HTML escape a string.
   *
   * @param string The string to escape
   * @returns {string} the escaped string
   */
  escapeHTML: function(string) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(string));
    return div.innerHTML;
  },

  /**
   * Returns all of the properties for this object and all of its
   * inherited properties from parent objects.
   *
   * @param object
   * @returns {Array<string>}
   */
  getAllPropertyNames: function(object) {
    let props = {};

    do {
      Object.getOwnPropertyNames(object).forEach((prop) => {
        if (!props[prop]) {
          props[prop]=prop;
        }
      })
    } while (object = Object.getPrototypeOf(object));

    return Object.keys(props);
  },

  /**
   * Binds all of the functions inside the object so that <code>this</code> is the object. This is extremely useful for
   * objects that have functions that will be used as event listeners. Rather than having to manage binding and function
   * references manually you can instead bind all of the functions in the object and then use them directly for event
   * listeners.
   *
   * Here's an example:
   *
   * <pre>
   *   function Foo() {
   *     Utils.bindAll(this);
   *
   *     // This function is bound to this (i.e. this.handleClick = this.handleClick.bind(this)).
   *     PrimeDocument.queryFirst('a').addEventListener('click', this.handleClick);
   *   }
   *
   *   Foo.prototype = {
   *     handleClick: function(event) {
   *       ...
   *     }
   *   };
   * </pre>
   *
   * @param {*} object The object to bind all the functions for.
   * @param {String} arguments A varargs list of function names to bind.
   */
  bindSome: function(object) {
    if (arguments.length > 1) {
      for (let i = 1; i < arguments.length; i++) {
        const func = object[arguments[i]];
        if (!Utils.isDefined(func) || !(func instanceof Function)) {
          throw new TypeError('The object does not contain a function named [' + arguments[i] + ']');
        }

        object[arguments[i]] = func.bind(object);
      }
    }
    for (let property in object) {
      if (object[property] instanceof Function) {
        object[property] = object[property].bind(object);
      }
    }
  },

  /**
   * Safely binds a function to a context.
   *
   * @param {Function} func The function to bind.
   * @param {Object} [context] An optional context to bind the function to.
   * @returns {Function} Either <code>func</code> or the newly bound function.
   */
  bindSafe: function(func, context) {
    if (!Utils.isDefined(func)) {
      throw new Error('Invalid arguments');
    }

    if (!Utils.isDefined(context)) {
      return func;
    }

    return func.bind(context);
  },

  /**
   * Calculates the length of the given text using the style of the given element.
   *
   * @param {PrimeElement} element The element to use the style of.
   * @param {string} text The text to calculate the length of.
   * @returns {number} The length of the text.
   */
  calculateTextLength: function(element, text) {
    const computedStyle = element.getComputedStyle();
    let textCalculator = PrimeDocument.queryById('prime-text-calculator');
    if (textCalculator === null) {
      textCalculator = PrimeDocument.newElement('<span/>')
          .setStyles({
            position: 'absolute',
            width: 'auto',
            fontSize: computedStyle['fontSize'],
            fontFamily: computedStyle['fontFamily'],
            fontWeight: computedStyle['fontWeight'],
            letterSpacing: computedStyle['letterSpacing'],
            whiteSpace: 'nowrap'
          })
          .setId('prime-text-calculator')
          .setTop(-9999)
          .setLeft(-9999)
          .appendTo(document.body);
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
   */
  callIteratively: function(totalDuration, timesToCall, stepFunction, endFunction) {
    const step = totalDuration / timesToCall;
    let count = 0;
    const id = setInterval(function() {
      count++;
      const last = (count >= timesToCall);
      stepFunction(last);
      if (last) {
        clearInterval(id);

        if (Utils.isDefined(endFunction)) {
          endFunction();
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

    let dash = name.indexOf('-');
    if (dash === -1) {
      return name;
    }

    let start = 0;
    let result = '';
    while (dash !== -1) {
      const piece = name.substring(start, dash);
      if (start === 0) {
        result = result.concat(piece);
      } else {
        result = result.concat(Utils.capitalize(piece));
      }

      start = dash + 1;
      dash = name.indexOf('-', start);
    }

    return result + Utils.capitalize(name.substring(start));
  },

  /**
   * Return an options map {Object} of the data set values coerced to a typed value of boolean, string or number.
   *
   * @param {PrimeElement} element The element.
   * @returns {Object} The options object.
   */
  dataSetToOptions: function(element) {
    const options = {};
    const data = element.getDataSet();
    for (let prop in data) {
      if (!data.hasOwnProperty(prop)) {
        continue;
      }
      const value = data[prop];
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
   * Tests whether or not the value is not null and not 'undefined'.
   *
   * @param {*} value The value to test.
   * @returns {boolean} True if the value is defined (not null or undefined).
   */
  isDefined: function(value) {
    return value !== null && typeof(value) !== 'undefined';
  },

  /**
   * Parses a CSS measure value (12px) as an integer.
   *
   * @param {string} measure The CSS measure
   * @returns {number} The value as an integer.
   */
  parseCSSMeasure: function(measure) {
    const index = measure.indexOf('px');
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
   * Removes the objects in the toRemove array from the fromArray.
   *
   * @param {Array} fromArray The array to remove from.
   * @param {Array} toRemove The values to remove.
   */
  removeAllFromArray: function(fromArray, toRemove) {
    for (let i = 0; i < toRemove.length; i++) {
      Utils.removeFromArray(fromArray, toRemove[i]);
    }
  },

  /**
   * Removes the given object from the given array.
   *
   * @param {Array} array The array to remove from.
   * @param {*} obj The object to remove.
   */
  removeFromArray: function(array, obj) {
    const index = array.indexOf(obj);
    if (index !== -1) {
      const shift = array.splice(index + 1, array.length);
      array.length = index;
      array.push.apply(array, shift);
    }
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
    return Object.prototype.toString.call(object).match(Utils.typeRegex)[1];
  }
};

export {Utils};

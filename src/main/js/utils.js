/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
 */
var Prime = Prime || {};
Prime.Utils = Prime.Utils || {};

Prime.Utils = {
  spaceRegex: /\s+/,
  typeRegex: /^\[object\s(.*)\]$/,

  /**
   * Attempts to invoke a function iteratively in the background a specific number of times within a specific duration.
   * This might not complete in the specified duration. The functions passed in should be short functions that return as
   * quickly as possible. If you are using long functions, use the recursive setTimeout trick by-hand instance.
   *
   * @param {Number} totalDuration The duration in milliseconds.
   * @param {Number} timesToCall The number of times to call the function.
   * @param {Function} stepFunction The step function to call each iteration.
   * @param {Function} [endFunction] The function to invoke at the end.
   * @param {Object} [context] The context for the function calls (sets the 'this' parameter).
   */
  callIteratively: function(totalDuration, timesToCall, stepFunction, endFunction, context) {
    var theContext = (arguments.length < 5) ? this : context;
    var step = totalDuration / timesToCall;
    var count = 0;
    var id = setInterval(function() {
      stepFunction.call(theContext);
      count++;
      if (count >= timesToCall) {
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
   * @param {String} json The JSON.
   * @return {Object} The JSON data as an object.
   */
  parseJSON: function(json) {
    return JSON.parse(json);
  },

  /**
   * Proxies calls to a function through an anonymous function and sets the "this" variable to the object given.
   *
   * @param {Object} object The "this" variable when the function is called.
   * @param {Function} func The function to call.
   * @return {Function} An anonymous function.
   */
  proxy: function(object, func) {
    return function() {
      func.apply(object, arguments);
    }
  },

  type: function(object) {
    return Object.prototype.toString(object).match(Prime.Utils.typeRegex)[1];
  }
};

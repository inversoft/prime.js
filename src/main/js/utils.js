/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
 */
var Prime = Prime || {};
Prime.Utils = Prime.Utils || {};

Prime.Utils = {
  spaceRegex: /\s+/,
  typeRegex: /^\[object\s(.*)\]$/,

  /**
   * Proxies calls to a function through an anonymous function and sets the "this" variable to the object given.
   *
   * @param {Object} object The "this" variable when the function is called.
   * @param {Function} func The function to call.
   * @return {Function} An anonymous function.
   */
  proxy: function (object, func) {
    return function() {
      func.apply(object, arguments);
    }
  },

  type: function(object) {
    return Object.prototype.toString(object).match(Prime.Utils.typeRegex)[1];
  }
};

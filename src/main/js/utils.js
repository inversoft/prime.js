/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
 */
var IS = IS || {};
IS.Utils = IS.Utils || {};

/**
 * Proxies calls to a function through an anonymous function and sets the "this" variable to the object given.
 *
 * @param {Object} object The "this" variable when the function is called.
 * @param {Function} func The function to call.
 * @return {Function} An anonymous function.
 */
IS.Utils.proxy = function (object, func) {
  return function() {
    func.apply(object, arguments);
  }
};

IS.Utils.spaceRegex = /\s+/;

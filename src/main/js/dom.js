/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
 */
var Prime = Prime || {};
Prime.Dom = Prime.Dom || {};

/**
 * Creates an Element class for the given DOM element.
 *
 * @param {Element} element The element
 * @constructor
 */
Prime.Dom.Element = function(element) {
  init(element);
};

Prime.Dom.Element.tagRegexp = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

  Prime.Dom.Element.query = function(query) {
  var jq = $(query);
  if (jq.length !== 1) {
    throw 'Bad query [' + query + ']returned multiple elements';
  }

  return new Prime.Dom.Element(jq[0]);
};

Prime.Dom.Element.forID = function(id) {
  var element = document.getElementById(id);
  if (!element) {
    throw 'Invalid ID [' + id + ']';
  }

  return new Prime.Dom.Element(element);
};

Prime.Dom.Element.build = function(elementString) {
  var result = Prime.Dom.Element.tagRegexp.exec(elementString);
  if (result == null) {
    throw 'Invalid element string [' + elementString + ']';
  }

  var element = document.createElement(result[0]);
  return new Prime.Dom.Element(element);
};

Dom.Element.prototype = {
  init: function(element) {
    this.element = element;
  },

  addClass: function(className) {
    if (!this.element.className) {
      this.element.className = className;
    } else {
      var classNames = className.split(Prime.Utils.spaceRegex);
      var finalClassName = this.element.className;
      for (var i = 0; i < classNames.length; i++) {
        if ()
        finalClassName = finalClassName + " " + classNames[i];
      }
    }
  }
};
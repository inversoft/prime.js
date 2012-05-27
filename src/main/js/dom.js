/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
 */
var IS = IS || {};
IS.Dom = IS.Dom || {};

/**
 * Creates an Element class for the given DOM element.
 *
 * @param {Element} element The element
 * @constructor
 */
IS.Dom.Element = function(element) {
  init(element);
};

IS.Dom.Element.tagRegexp = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

  IS.Dom.Element.query = function(query) {
  var jq = $(query);
  if (jq.length !== 1) {
    throw 'Bad query [' + query + ']returned multiple elements';
  }

  return new IS.Dom.Element(jq[0]);
};

IS.Dom.Element.forID = function(id) {
  var element = document.getElementById(id);
  if (!element) {
    throw 'Invalid ID [' + id + ']';
  }

  return new IS.Dom.Element(element);
};

IS.Dom.Element.build = function(elementString) {
  var result = IS.Dom.Element.tagRegexp.exec(elementString);
  if (result == null) {
    throw 'Invalid element string [' + elementString + ']';
  }

  var element = document.createElement(result[0]);
  return new IS.Dom.Element(element);
};

Dom.Element.prototype = {
  init: function(element) {
    this.element = element;
  },

  addClass: function(className) {
    if (!this.element.className) {
      this.element.className = className;
    } else {
      var classNames = className.split(IS.Utils.spaceRegex);
      var finalClassName = this.element.className;
      for (var i = 0; i < classNames.length; i++) {
        if ()
        finalClassName = finalClassName + " " + classNames[i];
      }
    }
  }
};
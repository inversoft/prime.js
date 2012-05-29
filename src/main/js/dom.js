/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
 */
var Prime = Prime || {};

/**
 * The DOM namespace.
 *
 * @type {Object}
 */
Prime.Dom = {
  tagRegexp: /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

  /**
   * Queries the DOM using the given Sizzle selector starting at the given context and returns all the matched elements.
   *
   * @param {String} selector The selector.
   * @param {HTMLElement|HTMLDocument} [context] The context element (defaults to document if not provided).
   * @return {Prime.Dom.ElementList} An element list.
   */
  query: function(selector, context) {
    return new Prime.Dom.ElementList(Sizzle(selector, context));
  },

  /**
   * Queries the DOM using the given Sizzle selector starting at the given context and returns the first matched element
   * or null if there aren't any matches.
   *
   * @param {String} selector The selector.
   * @param {HTMLElement|HTMLDocument} [context] The context element (defaults to document if not provided).
   * @return {Prime.Dom.Element} An element or null.
   */
  queryFirst: function(selector, context) {
    var domElements = Sizzle(selector, context);
    if (domElements.length === 0) {
      return null;
    }

    return new Prime.Dom.Element(domElements[0]);
  },

  /**
   * Queries the DOM for an element that has the given ID.
   *
   * @param {String} id The ID.
   * @return {Prime.Dom.Element} The element or null.
   */
  queryByID: function(id) {
    var element = document.getElementById(id);
    if (!element) {
      return null;
    }

    return new Prime.Dom.Element(element);
  },

  /**
   * Builds a new element using the given HTML snippet (currently this only supports the tag).
   *
   * @param {String} elementString The element string.
   * @return {Prime.Dom.Element} A new Prime.DOM.Element.
   */
  newElement: function(elementString) {
    var result = Prime.Dom.Element.tagRegexp.exec(elementString);
    if (result == null) {
      throw 'Invalid element string [' + elementString + ']';
    }

    return new Prime.Dom.Element(document.createElement(result[0]));
  }
};


/**
 * Constructs an ElementList object using the given array of DOMElements.
 *
 * @param {Array} elements The array of DOMElement objects.
 * @constructor
 */
Prime.Dom.ElementList = function(elements) {
  this.init(elements);
};
Prime.Dom.ElementList.prototype = {
  init: function(elements) {
    this.length = elements.length;
    for (var i = 0; i < elements.length; i++) {
      this[i] = new Prime.Dom.Element(elements[i]);
    }
  }
};


/**
* Creates an Element class for the given DOM element.
*
* @param {Element} element The element
* @constructor
*/
Prime.Dom.Element = function(element) {
  this.init(element);
};
Prime.Dom.Element.prototype = {
  init: function(element) {
    this.domElement = element;
    this.id = element.id;
  },

  insertAfter: function(element) {

  }
};
